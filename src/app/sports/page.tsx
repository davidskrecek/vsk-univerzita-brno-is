import { Suspense } from "react";
import SectionHeader from "@/components/Common/SectionHeader";
import { getSports } from "@/lib/queries/sports";
import Loading from "@/app/loading";
import { PageReveal } from "@/components/Common/PageReveal";
import SportsList from "@/components/Sports/SportsList";

async function SportsListContainer() {
  const sports = await getSports();
  return (
    <PageReveal>
      <SportsList sports={sports} />
    </PageReveal>
  );
}

export default function SportsPage() {
  return (
    <div className="stack-page">
      <SectionHeader title="Sporty" as="h1" className="mb-4" />
      <Suspense fallback={<Loading />}>
        <SportsListContainer />
      </Suspense>
    </div>
  );
}
