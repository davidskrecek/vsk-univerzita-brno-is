"use client";

import { Suspense, useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import EmptyState from "@/components/Common/EmptyState";
import SportFilter from "@/components/Common/SportFilter/SportFilter";
import ViewToggle from "@/components/Common/ViewToggle";
import { Calendar } from "@/components/Events/Calendar/Calendar";
import { EventCard } from "@/components/Events/EventCard";
import EventDetail from "@/components/Events/EventDetail";
import {
  getCzechMonthShort,
  getEventDayOfMonth,
  extractEventSports,
  filterEventsBySport,
  findEventById,
  mapEventsApiResponseToUiEvents,
  sortEventsByStartTime,
  type UiEvent,
} from "@/components/Events/eventUtils";

type ViewMode = "calendar" | "list";

interface EventsContentProps {
  initialEvents: UiEvent[];
}

interface EventsListContentProps {
  events: UiEvent[];
}

const EventsListContent = ({ events }: EventsListContentProps) => {
  if (events.length === 0) {
    return <EmptyState message="Pro vybraný sport nebyly nalezeny žádné akce." />;
  }

  return (
    <>
      {events.map((event) => (
        <EventCard
          key={event.id}
          id={event.id}
          day={getEventDayOfMonth(event.date)}
          month={getCzechMonthShort(event.date)}
          category={event.sport}
          title={event.title}
          location={event.location || "Bude upřesněno"}
        />
      ))}
    </>
  );
};

function EventsContentInner({ initialEvents }: EventsContentProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [selectedSport, setSelectedSport] = useState<string | null>(null);

  const viewModeParam = searchParams.get("view");
  const viewMode: ViewMode = viewModeParam === "list" ? "list" : "calendar";
  const eventId = searchParams.get("eventId");

  const sports = useMemo(() => extractEventSports(initialEvents), [initialEvents]);
  const filteredEvents = useMemo(
    () => filterEventsBySport(initialEvents, selectedSport),
    [initialEvents, selectedSport]
  );
  const sortedFilteredEvents = useMemo(
    () => sortEventsByStartTime(filteredEvents),
    [filteredEvents]
  );
  const activeEvent = useMemo(
    () => findEventById(filteredEvents, eventId),
    [filteredEvents, eventId]
  );

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

  const toggleOptions = [
    { id: "calendar" as const, label: "Kalendář" },
    { id: "list" as const, label: "Seznam" },
  ];

  const listContent = (
    <div className="stack-list">
      <EventsListContent events={sortedFilteredEvents} />
    </div>
  );

  return (
    <div className="stack-page">
      <SportFilter
        sports={sports}
        selectedSport={selectedSport}
        onSportChange={setSelectedSport}
      />

      <div className="min-h-[420px] md:min-h-[600px]">
        <div className="md:hidden">{listContent}</div>
        <div className="hidden md:block">
          {viewMode === "calendar" ? (
            <Calendar events={filteredEvents} />
          ) : (
            listContent
          )}
        </div>
      </div>

      {activeEvent && (
        <EventDetail
          key={activeEvent.id}
          {...activeEvent}
          onClose={closeEventDetail}
        />
      )}
    </div>
  );
}

export default function EventsContent({ initialEvents }: EventsContentProps) {
  return (
    <Suspense fallback={<div>Načítání...</div>}>
      <EventsContentInner initialEvents={initialEvents} />
    </Suspense>
  );
}
