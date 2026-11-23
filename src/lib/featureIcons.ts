/** Ikonene redaktøren kan velge i fordelslisten. SVG-ene ligger i `components/ui/FeatureIcon.tsx`. */
export const featureIcons = [
  { value: "check", title: "Hake" },
  { value: "advice", title: "Rådgivning" },
  { value: "gear", title: "Drift" },
  { value: "warehouse", title: "Lager" },
  { value: "shield", title: "Sikkerhet" },
  { value: "truck", title: "Transport" },
  { value: "recycle", title: "Resirkulering" },
  { value: "leaf", title: "Bærekraft" },
  { value: "fish", title: "Fisk" },
  { value: "box", title: "Emballasje" },
  { value: "people", title: "Mennesker" },
  { value: "handshake", title: "Partnerskap" },
] as const;

export type FeatureIconName = (typeof featureIcons)[number]["value"];
