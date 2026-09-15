import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isTbd(value: string) {
  return value.trim().toUpperCase() === "TBD";
}

const nyDate: Intl.DateTimeFormatOptions = {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "America/New_York",
};

const nyTime: Intl.DateTimeFormatOptions = {
  hour: "numeric",
  minute: "2-digit",
  timeZone: "America/New_York",
};

export function formatDate(iso: string) {
  if (!iso || isTbd(iso)) return "Date TBA";

  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;

  // Fixed locale and timezone keep server and client output identical,
  // avoiding hydration mismatches from environment differences.
  return parsed.toLocaleDateString("en-US", nyDate);
}

/** Date, or date · start–end when `endDate` is provided. */
export function formatMeetingWhen(date: string, endDate?: string) {
  if (!date || isTbd(date)) return "Date TBA";

  const start = new Date(date);
  if (Number.isNaN(start.getTime())) return date;

  const datePart = start.toLocaleDateString("en-US", nyDate);
  if (!endDate || isTbd(endDate)) return datePart;

  const end = new Date(endDate);
  if (Number.isNaN(end.getTime())) return datePart;

  const startTime = start.toLocaleTimeString("en-US", nyTime);
  const endTime = end.toLocaleTimeString("en-US", nyTime);
  return `${datePart} · ${startTime}–${endTime}`;
}

export function formatLocation(location: string) {
  if (!location || isTbd(location)) return "Location TBA";
  return location;
}
