import { Suspense } from "react";
import SectionHeader from "@/components/Common/SectionHeader";
import CreateFormButton from "@/components/Common/CreateFormButton";
import EventCreateForm from "@/components/Forms/EventCreateForm";
import { getPublicEvents } from "@/lib/queries/events";
import { getSports } from "@/lib/queries/sports";
import EventsContent from "./EventsContent";
import EventsFilter from "@/components/Events/EventsFilter";
import Loading from "@/app/loading";
import MiniSpinner from "@/components/Common/MiniSpinner";
import { PageReveal } from "@/components/Common/PageReveal";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function EventsListContainer({ sport, sports }: { sport?: string; sports: any[] }) {
  const initialEvents = await getPublicEvents(sport);
  
  return (
    <PageReveal>
      <EventsContent initialEvents={initialEvents} availableSports={sports} />
    </PageReveal>
  );
}

async function NewEventButton() {
  const sports = await getSports();
  return (
    <CreateFormButton
      label="Nová akce"
      FormComponent={EventCreateForm}
      sports={sports}
    />
  );
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ sport?: string }>;
}) {
  const { sport } = await searchParams;
  const sports = await getSports();
  const sportNames = sports.map(s => s.name);
  
  const session = await getServerSession(authOptions);
  const canCreate = session?.user && (session.user.role === "superadmin" || session.user.role === "sport_manager");

  return (
    <div className="stack-page">
      <SectionHeader
        title="Kalendář akcí"
        as="h1"
        rightContent={
          canCreate ? (
            <Suspense fallback={<MiniSpinner />}>
              <NewEventButton />
            </Suspense>
          ) : null
        }
      />
      
      <EventsFilter availableSports={sportNames} />
      
      <Suspense fallback={<Loading />}>
        <EventsListContainer sport={sport} sports={sports} />
      </Suspense>
    </div>
  );
}
