import { Suspense } from "react";
import SectionHeader from "@/components/layout/SectionHeader";
import CreateFormButton from "@/components/features/admin/CreateFormButton";
import EventCreateForm from "@/components/features/events/EventCreateForm";
import { getPublicEvents } from "@/lib/queries/events";
import { getSports } from "@/lib/queries/sports";
import EventsContent from "./EventsContent";
import EventsFilter from "@/components/features/events/EventsFilter";
import Loading from "@/app/loading";
import MiniSpinner from "@/components/ui/Feedback/MiniSpinner";
import { PageReveal } from "@/components/layout/PageReveal";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isSuperAdminRole } from "@/lib/constants/roles";

async function EventsListContainer({ sport, sports, year, month }: { sport?: string; sports: any[]; year?: number; month?: number }) {
  const initialEvents = await getPublicEvents(sport, year, month);

  return (
    <PageReveal>
      <EventsContent initialEvents={initialEvents} availableSports={sports} year={year} month={month} />
    </PageReveal>
  );
}

async function NewEventButton() {
  const session = await getServerSession(authOptions);
  const allSports = await getSports();
  
  const availableSports = session?.user?.role === "superadmin"
    ? allSports
    : allSports.filter((sport) => session?.user?.managedSportIds?.includes(sport.id));
  
  return (
    <CreateFormButton
      label="Nová akce"
      FormComponent={EventCreateForm}
      sports={availableSports}
      requiredPermission="events:write"
    />
  );
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ sport?: string; view?: string; month?: string; year?: string }>;
}) {
  const { sport, view, month, year } = await searchParams;
  const sports = await getSports();

  const isCalendar = view !== "list";
  const now = new Date();
  const currentMonth = Number(month) || (isCalendar ? now.getMonth() + 1 : undefined);
  const currentYear = Number(year) || (isCalendar ? now.getFullYear() : undefined);

  const session = await getServerSession(authOptions);
  const canCreate = session?.user && (session?.user.permissions["posts:write"] === true || isSuperAdminRole(session.user.role));

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

      <EventsFilter availableSports={sports} />

      <Suspense fallback={<Loading />}>
        <EventsListContainer
          sport={sport}
          sports={sports}
          year={currentYear}
          month={currentMonth}
        />
      </Suspense>
    </div>
  );
}

