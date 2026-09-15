import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isTbd(value: string) {
  return value.trim().toUpperCase() === "TBD";
}

export function formatDate(iso: string) {
  if (!iso || isTbd(iso)) return "Date TBA";

  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;

  // Fixed locale and timezone keep server and client output identical,
  // avoiding hydration mismatches from environment differences.
  return parsed.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York",
  });
}

export function formatLocation(location: string) {
  if (!location || isTbd(location)) return "Location TBA";
  return location;
}
