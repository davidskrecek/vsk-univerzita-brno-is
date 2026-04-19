import { CalendarEvent } from "@/types/events";

export interface EventApiItem {
  id: number;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string | null;
  location: string | null;
  eventType: string | null;
  isPublic: boolean;
  isCancelled: boolean;
  sport: {
    id: number;
    name: string;
  };
}

export interface UiEvent extends CalendarEvent {
  description?: string;
  startTimeIso: string;
}

const PRAGUE_TIME_ZONE = "Europe/Prague";

const pragueDatePartsFormatter = new Intl.DateTimeFormat("en-GB", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: PRAGUE_TIME_ZONE,
});

const pragueTimeFormatter = new Intl.DateTimeFormat("cs-CZ", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: PRAGUE_TIME_ZONE,
});

const getPragueDateKey = (date: Date): string => {
  const parts = pragueDatePartsFormatter.formatToParts(date);
  const day = parts.find((part) => part.type === "day")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const year = parts.find((part) => part.type === "year")?.value;

  if (!day || !month || !year) {
    return date.toISOString().slice(0, 10);
  }

  return `${year}-${month}-${day}`;
};

export const mapEventApiItemToUiEvent = (event: EventApiItem): UiEvent => {
  const start = new Date(event.startTime);
  return {
    id: String(event.id),
    title: event.title,
    date: getPragueDateKey(start),
    time: pragueTimeFormatter.format(start),
    location: event.location ?? undefined,
    sport: event.sport.name,
    description: event.description ?? undefined,
    startTimeIso: event.startTime,
  };
};

export const mapEventsApiResponseToUiEvents = (payload: EventApiItem[]): UiEvent[] =>
  payload.map(mapEventApiItemToUiEvent);

export const extractEventSports = (events: UiEvent[]) =>
  Array.from(new Set(events.map((event) => event.sport))).sort((a, b) => a.localeCompare(b, "cs"));

export const filterEventsBySport = (events: UiEvent[], selectedSport: string | null): UiEvent[] =>
  selectedSport ? events.filter((event) => event.sport === selectedSport) : events;

export const sortEventsByStartTime = (events: UiEvent[]): UiEvent[] =>
  [...events].sort((a, b) => new Date(a.startTimeIso).getTime() - new Date(b.startTimeIso).getTime());

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