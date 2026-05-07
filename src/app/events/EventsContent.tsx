"use client";

import { Suspense, useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import EmptyState from "@/components/Common/EmptyState";
import SportFilter from "@/components/Common/SportFilter/SportFilter";
import { Modal } from "@/components/Overlay/Modal";
import { Calendar } from "@/components/Events/Calendar/Calendar";
import { EventCard } from "@/components/Events/EventCard";
import EventDetail from "@/components/Events/EventDetail";
import EditButton from "@/components/Common/EditButton";
import EventCreateForm from "@/components/Forms/EventCreateForm";
import {
  getCzechMonthShort,
  getEventDayOfMonth,
  extractEventSports,
  filterEventsBySport,
  findEventById,
  type UiEvent,
} from "@/components/Events/eventUtils";

type ViewMode = "calendar" | "list";

interface EventsContentProps {
  initialEvents: UiEvent[];
  availableSports: Array<{ id: number; name: string }>;
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

function EventsContentInner({ initialEvents, availableSports }: EventsContentProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();

  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [pendingEditEvent, setPendingEditEvent] = useState<UiEvent | null>(null);

  const viewModeParam = searchParams.get("view");
  const viewMode: ViewMode = viewModeParam === "list" ? "list" : "calendar";
  const eventId = searchParams.get("eventId");

  const sports = useMemo(() => extractEventSports(initialEvents), [initialEvents]);
  const filteredEvents = useMemo(
    () => filterEventsBySport(initialEvents, selectedSport),
    [initialEvents, selectedSport]
  );
  const activeEvent = useMemo(
    () => findEventById(filteredEvents, eventId),
    [filteredEvents, eventId]
  );

  const accessibleSports = useMemo(() => {
    if (!session?.user) return [];
    if (session.user.role === "superadmin") return availableSports;
    return availableSports.filter((sport) => session.user.managedSportIds?.includes(sport.id));
  }, [availableSports, session?.user]);

  const canEditActiveEvent = Boolean(
    activeEvent &&
      session?.user &&
      (session.user.role === "superadmin" || session.user.role === "sport_manager") &&
      accessibleSports.some((sport) => sport.id === activeEvent.sportId)
  );

  const closeEventDetail = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("eventId");
    const query = params.toString();
    router.push(query ? `?${query}` : "/events", { scroll: false });
  }, [router, searchParams]);

  const openEditForEvent = useCallback(() => {
    if (!activeEvent) return;
    setPendingEditEvent(activeEvent);
    setIsEditOpen(true);
    closeEventDetail();
  }, [activeEvent, closeEventDetail]);

  const closeEditModal = useCallback(() => {
    setIsEditOpen(false);
    setPendingEditEvent(null);
  }, []);

  const toggleOptions = [
    { id: "calendar" as const, label: "Kalendář" },
    { id: "list" as const, label: "Seznam" },
  ];

  const listContent = (
    <div className="stack-list">
      <EventsListContent events={filteredEvents} />
    </div>
  );

  return (
    <div className="stack-page">
      <SportFilter
        sports={sports}
        selectedSport={selectedSport}
        onSportChange={setSelectedSport}
      />

      <div className="min-h-105 md:min-h-150">
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
          actions={canEditActiveEvent ? <EditButton label="Upravit akci" onClick={openEditForEvent} /> : null}
          onClose={closeEventDetail}
        />
      )}

      {isEditOpen && pendingEditEvent ? (
        <Modal onClose={closeEditModal} contentClassName="max-w-4xl w-full">
          <div className="rounded-md border border-outline-variant/10 bg-surface-container-low p-6 shadow-ambient sm:p-8">
            <EventCreateForm
              mode="edit"
              sports={accessibleSports}
              initialValues={{
                id: Number(pendingEditEvent.id),
                sportId: pendingEditEvent.sportId,
                title: pendingEditEvent.title,
                description: pendingEditEvent.description ?? null,
                location: pendingEditEvent.location ?? null,
                startTime: pendingEditEvent.startTimeIso,
              }}
              onCancel={closeEditModal}
              onDeleted={closeEditModal}
              onSuccess={closeEditModal}
            />
          </div>
        </Modal>
      ) : null}
    </div>
  );
}

export default function EventsContent({ initialEvents, availableSports }: EventsContentProps) {
  return (
    <Suspense fallback={<div>Načítání...</div>}>
      <EventsContentInner initialEvents={initialEvents} availableSports={availableSports} />
    </Suspense>
  );
}
