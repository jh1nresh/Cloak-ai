export type StylePersona = "minimal" | "romantic" | "street" | "polished" | "experimental";
export type FitPriority = "length" | "waist" | "shoulder" | "comfort" | "occasion";
export type ShoppingIntent = "work" | "date" | "travel" | "daily" | "event";

export type StyleProfile = {
  name: string;
  email: string;
  persona: StylePersona;
  colors: string[];
  fitPriorities: FitPriority[];
  intents: ShoppingIntent[];
  savedFitPhotoName?: string;
  createdAt: string;
};

export const STYLE_PROFILE_STORAGE_KEY = "cloak-ai-style-profile";

export const personaLabels: Record<StylePersona, string> = {
  minimal: "Minimal editor",
  romantic: "Soft romantic",
  street: "Street polish",
  polished: "Quiet luxury",
  experimental: "Experimental muse",
};

export const intentLabels: Record<ShoppingIntent, string> = {
  work: "Work / meetings",
  date: "Date night",
  travel: "Travel capsule",
  daily: "Daily uniform",
  event: "Events",
};

export const fitPriorityLabels: Record<FitPriority, string> = {
  length: "Length / proportions",
  waist: "Waist and drape",
  shoulder: "Shoulder line",
  comfort: "Comfort first",
  occasion: "Right for occasion",
};

export function createDefaultProfile(): StyleProfile {
  return {
    name: "",
    email: "",
    persona: "polished",
    colors: ["Pearl", "Espresso", "Plum"],
    fitPriorities: ["length", "comfort"],
    intents: ["daily", "date"],
    createdAt: new Date().toISOString(),
  };
}
