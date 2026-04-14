import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper to safely parse imageUrls from database (JSON field)
export function safeParseImageUrls(imageUrls: any): string[] {
  if (!imageUrls) return [];
  // If it's already an array, return it
  if (Array.isArray(imageUrls))
    return imageUrls.filter((url) => typeof url === "string");
  // If it's a string (JSON stringified), try to parse it
  if (typeof imageUrls === "string") {
    try {
      const parsed = JSON.parse(imageUrls);
      return Array.isArray(parsed)
        ? parsed.filter((url) => typeof url === "string")
        : [];
    } catch {
      return [];
    }
  }
  return [];
}
