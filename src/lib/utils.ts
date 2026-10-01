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

/**
 * Date, or date · start–end when `endDate` is provided.
 * With `withStartTime`, events without an end time show date · start.
 */
export function formatMeetingWhen(date: string, endDate?: string, withStartTime = false) {
  if (!date || isTbd(date)) return "Date TBA";

  const start = new Date(date);
  if (Number.isNaN(start.getTime())) return date;

  const datePart = start.toLocaleDateString("en-US", nyDate);
  if (!endDate || isTbd(endDate)) {
    return withStartTime ? `${datePart} · ${start.toLocaleTimeString("en-US", nyTime)}` : datePart;
  }

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
