import type { LmsCourseBlockConfig } from "./types";

export type ArtworkTarget = "backgroundImage" | "imageUrl" | "logoUrl";

export function artworkBackground(config: Partial<LmsCourseBlockConfig>) {
  const image = config.backgroundImage || (config.imagePosition === "behind" ? config.imageUrl : "");
  return image && (image.startsWith("blob:") || artworkUrlValid(image)) ? `url(${JSON.stringify(image)})` : config.gradient || undefined;
}

export function artworkChange(field: ArtworkTarget | "gradient" | "imagePosition", value: string): Partial<LmsCourseBlockConfig> {
  if (field === "gradient") return { gradient: value, ...(value ? { backgroundImage: "", imagePosition: "before" as const } : {}) };
  if (field === "backgroundImage") return { backgroundImage: value, ...(value ? { gradient: "", imagePosition: "before" as const } : {}) };
  if (field === "imagePosition") return { imagePosition: value as LmsCourseBlockConfig["imagePosition"], ...(value === "behind" ? { gradient: "", backgroundImage: "" } : {}) };
  return { [field]: value };
}

export function artworkUrlValid(value?: string) {
  if (!value?.trim()) return true;
  try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password; } catch { return false; }
}
