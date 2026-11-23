/**
 * Felles hjelpere for importskriptene: gjør innhold i GROQ-form (slik
 * reserveinnholdet og innholdsfilene er skrevet) om til Sanity-dokumenter.
 */
import { createReadStream } from "node:fs";
import { basename, join } from "node:path";
import { Readable } from "node:stream";

import type { SanityClient } from "sanity";

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };
export type JsonObject = { [key: string]: Json };
export type SanityDocument = JsonObject & { _id: string; _type: string };

/** Fast dokument-ID, f.eks. `page-nb-om-oss` eller `product-nb-fiskekasse`. */
export const docId = (type: string, language: string, slug: string) =>
  `${type}-${language}-${slug.replaceAll("/", "-")}`;

/** Felt som inneholder en lenke, og arrayer med kjent elementtype. */
const linkFields = new Set(["link", "cta", "headerCta"]);
const arrayItemTypes: Record<string, string> = {
  mainMenu: "menuItem",
  groups: "linkGroup",
  footerGroups: "linkGroup",
  links: "link",
  legalLinks: "link",
  ctas: "link",
  cards: "card",
  items: "featureItem",
  socialLinks: "socialLink",
  properties: "productProperty",
};

const isObject = (value: unknown): value is JsonObject =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export class DocumentConverter {
  private uploaded = new Map<string, string>();

  constructor(
    private client: SanityClient,
    private dryRun: boolean,
  ) {}

  get uploadCount() {
    return this.uploaded.size;
  }

  /** Laster opp et bilde fra `public/` eller en ekstern URL, og gjenbruker opplastede bilder. */
  async uploadImage(url: string): Promise<string> {
    const cached = this.uploaded.get(url);
    if (cached) return cached;
    const filename = basename(new URL(url, "https://lokal").pathname);
    if (this.dryRun) {
      const fakeId = `image-dryrun-${filename}`;
      this.uploaded.set(url, fakeId);
      return fakeId;
    }
    let body: Readable;
    if (url.startsWith("http")) {
      const response = await fetch(url);
      if (!response.ok || !response.body) throw new Error(`Kunne ikke laste ned ${url}: ${response.status}`);
      body = Readable.fromWeb(response.body as import("node:stream/web").ReadableStream);
    } else {
      body = createReadStream(join(process.cwd(), "public", url));
    }
    const asset = await this.client.assets.upload("image", body, { filename });
    this.uploaded.set(url, asset._id);
    console.log(`  ↑ ${filename}`);
    return asset._id;
  }

  /** Lenke fra GROQ-form ({ internal: { _type, slug } }) til dokumentform (referanse). */
  private toLinkValue(value: JsonObject, language: string, type: string): JsonObject {
    const { internal, ...rest } = value;
    const result: JsonObject = { ...rest, _type: type };
    if (isObject(internal) && typeof internal.slug === "string" && typeof internal._type === "string") {
      result.internal = { _type: "reference", _ref: docId(internal._type, language, internal.slug) };
    }
    return result;
  }

  /**
   * Gjør en verdi i GROQ-form om til dokumentform: fjerner null-verdier,
   * legger på `_type` der skjemaet krever det, gjør lenker om til referanser
   * og laster opp bilder.
   */
  async convert(value: unknown, language: string, field?: string): Promise<Json> {
    if (value === null || value === undefined) return null;

    if (Array.isArray(value)) {
      const itemType = field ? arrayItemTypes[field] : undefined;
      const items = await Promise.all(
        value.map(async (item, index) => {
          const converted = await this.convert(item, language);
          if (!isObject(converted)) return converted;
          if (itemType === "link")
            return this.toLinkValue({ _key: `k${index}`, ...converted }, language, "link");
          return {
            _key: `k${index}`,
            ...(itemType && !converted._type ? { _type: itemType } : {}),
            ...converted,
          };
        }),
      );
      const result = items.filter((item) => item !== null);
      // Tomme lister lagres ikke. Det gjelder også felt som bare finnes i GROQ-resultatet.
      return result.length ? result : null;
    }

    if (!isObject(value)) return value as Json;

    // Bilde (lokalt i public/ eller eksternt): last opp og pek på asset.
    if (typeof value.url === "string" && "width" in value && "alt" in value) {
      const assetId = await this.uploadImage(value.url);
      return {
        _type: "imageWithAlt",
        asset: { _type: "reference", _ref: assetId },
        ...(value.alt ? { alt: value.alt } : {}),
      };
    }

    const entries = await Promise.all(
      Object.entries(value).map(
        async ([key, child]) => [key, await this.convert(child, language, key)] as const,
      ),
    );
    const result: JsonObject = Object.fromEntries(entries.filter(([, child]) => child !== null));

    if (value._type === "linkAnnotation") return this.toLinkValue(result, language, "linkAnnotation");
    if (field && linkFields.has(field) && "linkType" in value)
      return this.toLinkValue(result, language, "link");
    if (field === "seo") {
      // Delingsbilde er en URL i GROQ-resultatet og legges ikke inn her.
      const { image: _image, ...seo } = result;
      return { _type: "seo", ...seo };
    }
    return result;
  }

  async convertObject(value: unknown, language: string): Promise<JsonObject> {
    return ((await this.convert(value, language)) ?? {}) as JsonObject;
  }
}

/** Referanse til et dokument med fast ID. */
export const ref = (type: string, language: string, slug: string, key?: string) => ({
  ...(key ? { _key: key } : {}),
  _type: "reference",
  _ref: docId(type, language, slug),
});
