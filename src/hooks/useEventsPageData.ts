"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  extractEventSports,
  filterEventsBySport,
  findEventById,
  mapEventsApiResponseToUiEvents,
  sortEventsByStartTime,
  type EventApiItem,
  type UiEvent,
} from "@/components/Events/eventUtils";
import { useApiData } from "@/hooks/useApiData";

export type ViewMode = "calendar" | "list";

interface UseEventsPageDataResult {
  viewMode: ViewMode;
  loading: boolean;
  error: string | null;
  selectedSport: string | null;
  setSelectedSport: (sport: string | null) => void;
  sports: string[];
  filteredEvents: UiEvent[];
  sortedFilteredEvents: UiEvent[];
  activeEvent: UiEvent | null;
  setViewMode: (mode: ViewMode) => void;
  closeEventDetail: () => void;
}

export const useEventsPageData = (): UseEventsPageDataResult => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [selectedSport, setSelectedSport] = useState<string | null>(null);

  const viewModeParam = searchParams.get("view");
  const viewMode: ViewMode = viewModeParam === "list" ? "list" : "calendar";
  const eventId = searchParams.get("eventId");

  const { data, loading, error } = useApiData<EventApiItem[], UiEvent[]>({
    url: "/api/events",
    errorMessage: "Nepodařilo se načíst akce",
    mapData: mapEventsApiResponseToUiEvents,
  });

  const events = useMemo(() => data ?? [], [data]);

  const sports = useMemo(() => extractEventSports(events), [events]);
  const filteredEvents = useMemo(() => filterEventsBySport(events, selectedSport), [events, selectedSport]);
  const sortedFilteredEvents = useMemo(() => sortEventsByStartTime(filteredEvents), [filteredEvents]);
  const activeEvent = useMemo(() => findEventById(filteredEvents, eventId), [filteredEvents, eventId]);

  const setViewMode = useCallback(
    (mode: ViewMode) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("view", mode);
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const closeEventDetail = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("eventId");
    const query = params.toString();
    router.push(query ? `?${query}` : "/events", { scroll: false });
  }, [router, searchParams]);

  return {
    viewMode,
    loading,
    error,
    selectedSport,
    setSelectedSport,
    sports,
    filteredEvents,
    sortedFilteredEvents,
    activeEvent,
    setViewMode,
    closeEventDetail,
  };
};
