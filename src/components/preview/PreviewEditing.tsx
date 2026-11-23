"use client";

import { useRouter } from "next/navigation";
import { VisualEditing } from "next-sanity/visual-editing";

/**
 * Klikk-for-å-redigere i Presentation-verktøyet.
 *
 * Når redaktøren endrer en kladd, sender Studio en «mutation»-melding.
 * Standardoppførselen i `next-sanity` er å overlate oppdateringen til
 * `<SanityLive includeDrafts />`, men den krever et token i nettleseren.
 * Vi henter i stedet siden på nytt fra serveren, som leser kladdene med
 * lesetokenet. Tokenet forlater aldri serveren.
 */
export function PreviewEditing() {
  const router = useRouter();

  return (
    <VisualEditing
      refresh={(payload) => {
        if (payload.source === "manual" || payload.source === "mutation") {
          router.refresh();
        }
        // Studio viser en laster til løftet er innfridd.
        return new Promise((resolve) => setTimeout(resolve, 1000));
      }}
    />
  );
}
