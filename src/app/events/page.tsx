"use client";

import { Suspense } from "react";
import EmptyState from "@/components/Common/EmptyState";
import SectionHeader from "@/components/Common/SectionHeader";
import SportFilter from "@/components/Common/SportFilter/SportFilter";
import ViewToggle from "@/components/Common/ViewToggle";
import { Calendar } from "@/components/Events/Calendar/Calendar";
import { EventCard } from "@/components/Events/EventCard";
import EventDetail from "@/components/Events/EventDetail";
import {
  getCzechMonthShort,
  getEventDayOfMonth,
  type UiEvent,
} from "@/components/Events/eventUtils";
import { useEventsPageData } from "@/hooks/useEventsPageData";

interface EventsListContentProps {
  loading: boolean;
  error: string | null;
  events: UiEvent[];
}

const EventsListContent = ({ loading, error, events }: EventsListContentProps) => {
  if (loading) {
    return <p className="text-sm font-sans text-on-surface/60">Načítání akcí...</p>;
  }

  if (error) {
    return <EmptyState message={error} />;
  }

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

function EventsContent() {
  const {
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
  } = useEventsPageData();

  const toggleOptions = [
    { id: "calendar" as const, label: "Kalendář" },
    { id: "list" as const, label: "Seznam" },
  ];

  const listContent = (
    <div className="stack-list">
      <EventsListContent loading={loading} error={error} events={sortedFilteredEvents} />
    </div>
  );

  return (
    <div className="stack-page">
      <SectionHeader 
        title="Kalendář akcí" 
        as="h1" 
        rightContent={
          <div className="hidden md:block">
            <ViewToggle 
              options={toggleOptions} 
              activeId={viewMode} 
              onChange={setViewMode} 
            />
          </div>
        }
      />

      {/* FILTER SECTION */}
      <SportFilter 
        sports={sports} 
        selectedSport={selectedSport} 
        onSportChange={setSelectedSport} 
      />

      <div className="min-h-[420px] md:min-h-[600px]">
        <div className="md:hidden">{listContent}</div>
        <div className="hidden md:block">
          {viewMode === 'calendar' ? <Calendar events={filteredEvents} /> : listContent}
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

export default function EventsPage() {
  return (
    <Suspense fallback={<div>Načítání...</div>}>
      <EventsContent />
    </Suspense>
  );
}
