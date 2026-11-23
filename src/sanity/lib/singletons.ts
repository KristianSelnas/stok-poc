/** Fast dokument-ID for en singleton i et gitt språk, f.eks. `siteSettings-nb`. */
export function singletonId(type: string, language: string): string {
  return `${type}-${language}`;
}
