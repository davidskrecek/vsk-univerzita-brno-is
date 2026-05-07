import { Suspense } from "react";
import SectionHeader from "@/components/Common/SectionHeader";
import CreateFormButton from "@/components/Common/CreateFormButton";
import EventCreateForm from "@/components/Forms/EventCreateForm";
import { getPublicEvents } from "@/lib/queries/events";
import { getSports } from "@/lib/queries/sports";
import EventsContent from "./EventsContent";
import EventsLoading from "./loading";

export default async function EventsPage() {
  const initialEvents = await getPublicEvents();
  const sports = await getSports();

  return (
    <div className="stack-page">
      <SectionHeader
        title="Kalendář akcí"
        as="h1"
        rightContent={
          <CreateFormButton
            label="Nová akce"
            FormComponent={EventCreateForm}
            sports={sports}
          />
        }
      />
      <Suspense fallback={<EventsLoading />}>
        <EventsContent initialEvents={initialEvents} availableSports={sports} />
      </Suspense>
    </div>
  );
}
