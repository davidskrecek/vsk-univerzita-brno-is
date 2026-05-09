"use client";

import { Suspense, useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { AnimatePresence } from "framer-motion";
import EmptyState from "@/components/Common/EmptyState";
import { Modal } from "@/components/Overlay/Modal";
import { Calendar } from "@/components/Events/Calendar/Calendar";
import { EventCard } from "@/components/Events/EventCard";
import EventDetail from "@/components/Events/EventDetail";
import EditButton from "@/components/Common/EditButton";
import EventCreateForm from "@/components/Forms/EventCreateForm";
import Loading from "@/app/loading";
import ViewToggle from "@/components/Common/ViewToggle";
import {
  getCzechMonthShort,
  getEventDayOfMonth,
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

  const selectedSport = searchParams.get("sport");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [pendingEditEvent, setPendingEditEvent] = useState<UiEvent | null>(null);

  const viewModeParam = searchParams.get("view");
  const viewMode: ViewMode = viewModeParam === "list" ? "list" : "calendar";

  const accessibleSports =
    !session?.user
      ? []
      : session.user.role === "superadmin"
        ? availableSports
        : availableSports.filter((sport) => session.user.managedSportIds?.includes(sport.id));

  const openEditForEvent = useCallback((detail: UiEvent) => {
    setPendingEditEvent(detail);
    setIsEditOpen(true);
  }, []);

  const closeEditModal = useCallback(() => {
    setIsEditOpen(false);
    setPendingEditEvent(null);
  }, []);

  const listContent = (
    <div className="stack-list">
      <EventsListContent events={initialEvents} />
    </div>
  );

  return (
    <div className="flex flex-col gap-12">
      <div className="min-h-105 md:min-h-150">
        <div className="md:hidden">{listContent}</div>
        <div className="hidden md:block">
          {viewMode === "calendar" ? (
            <Calendar events={initialEvents} />
          ) : (
            listContent
          )}
        </div>
      </div>

      <AnimatePresence>
        {isEditOpen && pendingEditEvent && (
          <Modal onClose={closeEditModal} contentClassName="max-w-4xl w-full">
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
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function EventsContent({ initialEvents, availableSports }: EventsContentProps) {
  return <EventsContentInner initialEvents={initialEvents} availableSports={availableSports} />;
}
