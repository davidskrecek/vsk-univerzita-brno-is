import { Suspense } from "react";
import SectionHeader from "@/components/layout/SectionHeader";
import CreateFormButton from "@/components/features/admin/CreateFormButton";
import EventCreateForm from "@/components/features/events/EventCreateForm";
import { getPublicEvents } from "@/lib/queries/events";
import EventsContent from "./EventsContent";
import EventsFilter from "@/components/features/events/EventsFilter";
import Loading from "@/app/loading";
import MiniSpinner from "@/components/ui/Feedback/MiniSpinner";
import { PageReveal } from "@/components/layout/PageReveal";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isSuperAdminRole } from "@/lib/constants/roles";

async function EventsListContainer({ sport, year, month }: { sport?: string; year?: number; month?: number }) {
  const initialEvents = await getPublicEvents(sport, year, month);

  return (
    <PageReveal>
      <EventsContent initialEvents={initialEvents} year={year} month={month} />
    </PageReveal>
  );
}

function NewEventButton() {
  return (
    <CreateFormButton
      label="Nová akce"
      FormComponent={EventCreateForm}
    />
  );
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ sport?: string; month?: string; year?: string }>;
}) {
  const { sport, month, year } = await searchParams;

  const now = new Date();
  const currentMonth = Number(month) || now.getMonth() + 1;
  const currentYear = Number(year) || now.getFullYear();

  const session = await getServerSession(authOptions);
  const canCreate = session?.user && (session.user.permissions?.["events:write"] === true || isSuperAdminRole(session.user.role));

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

      <EventsFilter />

      <Suspense fallback={<Loading />}>
        <EventsListContainer
          sport={sport}
          year={currentYear}
          month={currentMonth}
        />
      </Suspense>
    </div>
  );
}

