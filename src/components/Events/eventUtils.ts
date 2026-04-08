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

export const mapEventApiItemToUiEvent = (event: EventApiItem): UiEvent => {
  const start = new Date(event.startTime);
  return {
    id: String(event.id),
    title: event.title,
    date: start.toISOString().slice(0, 10),
    time: start.toLocaleTimeString("cs-CZ", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Prague",
    }),
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

export const getEventDayOfMonth = (dateStr: string): string => String(new Date(dateStr).getDate());

export const getCzechMonthShort = (dateStr: string) => {
  const months = ["LED", "ÚNO", "BŘE", "DUB", "KVĚ", "ČER", "ČVC", "SRP", "ZÁŘ", "ŘÍJ", "LIS", "PRO"];
  return months[new Date(dateStr).getMonth()];
};