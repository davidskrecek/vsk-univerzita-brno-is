import { getPublicEvents } from "@/lib/queries/events";
import EventsContent from "./EventsContent";

export default async function EventsPage() {
  const events = await getPublicEvents();

  return <EventsContent initialEvents={events} />;
}
