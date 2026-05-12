"use client";

import { Suspense, useCallback, useMemo, useState } from "react";
import { useSports } from "@/components/features/sports/SportsProvider";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { AnimatePresence } from "framer-motion";
import EmptyState from "@/components/ui/Feedback/EmptyState";
import { Modal } from "@/components/ui/Overlay/Modal";
import { Calendar } from "@/components/features/events/Calendar/Calendar";
import { EventCard } from "@/components/features/events/EventCard";
import EventDetail from "@/components/features/events/EventDetail";
import EditButton from "@/components/ui/Actions/EditButton";
import EventCreateForm from "@/components/features/events/EventCreateForm";
import Loading from "@/app/loading";
import ViewToggle from "@/components/ui/Actions/ViewToggle";
import {
  getCzechMonthShort,
  getEventDayOfMonth,
  findEventById,
  type UiEvent,
} from "@/components/features/events/eventUtils";

type ViewMode = "calendar" | "list";

interface EventsContentProps {
  initialEvents: UiEvent[];
  year?: number;
  month?: number;
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

function EventsContentInner({ initialEvents, year, month }: EventsContentProps) {
  const { sports: availableSports } = useSports();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const now = new Date();
  const activeYear = year || now.getFullYear();
  const activeMonth = month || now.getMonth() + 1;

  const viewModeParam = searchParams.get("view");
  const viewMode: ViewMode = viewModeParam === "list" ? "list" : "calendar";

  const accessibleSports =
    !session?.user
      ? []
      : session.user.role === "superadmin"
        ? availableSports
        : availableSports.filter((sport) => session.user.managedSportIds?.includes(sport.id));

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [pendingEditEvent, setPendingEditEvent] = useState<UiEvent | null>(null);

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
            <Calendar events={initialEvents} year={activeYear} month={activeMonth} />
          ) : (
            listContent
          )}
        </div>
      </div>

      <AnimatePresence>
        {isEditOpen && pendingEditEvent && (
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
        )}
      </AnimatePresence>
    </div>
  );
}

export default function EventsContent({ initialEvents, year, month }: EventsContentProps) {
  return <EventsContentInner initialEvents={initialEvents} year={year} month={month} />;
}

