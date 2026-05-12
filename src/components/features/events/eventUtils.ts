import { CalendarEvent } from "@/types/events";

export interface UiEvent extends CalendarEvent {
  description?: string;
  startTimeIso: string;
  canEdit?: boolean;
  canDelete?: boolean;
  links?: Array<{ url: string; alias: string | null }>;
}

export const findEventById = (events: UiEvent[], eventId: string | null): UiEvent | null =>
  eventId ? events.find((event) => event.id === eventId) ?? null : null;

export const parseDateKey = (dateStr: string): { year: number; month: number; day: number } | null => {
  const [yearRaw, monthRaw, dayRaw] = dateStr.split("-");
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return null;
  }

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  return { year, month, day };
};

export const getEventDayOfMonth = (dateStr: string): string => {
  const parsed = parseDateKey(dateStr);
  return parsed ? String(parsed.day) : dateStr;
};

export const getCzechMonthShort = (dateStr: string) => {
  const months = ["LED", "ÚNO", "BŘE", "DUB", "KVĚ", "ČER", "ČVC", "SRP", "ZÁŘ", "ŘÍJ", "LIS", "PRO"];
  const parsed = parseDateKey(dateStr);
  return parsed ? months[parsed.month - 1] : months[0];
};

