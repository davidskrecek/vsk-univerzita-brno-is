import { Suspense } from "react";
import SectionHeader from "@/components/Common/SectionHeader";
import { getPublicEvents } from "@/lib/queries/events";
import EventsContent from "./EventsContent";
import EventsLoading from "./loading";

export default async function EventsPage() {
  const initialEvents = await getPublicEvents();

  return (
    <div className="stack-page">
      <SectionHeader title="Kalendář akcí" as="h1" />
      <Suspense fallback={<EventsLoading />}>
        <EventsContent initialEvents={initialEvents} />
      </Suspense>
    </div>
  );
}
