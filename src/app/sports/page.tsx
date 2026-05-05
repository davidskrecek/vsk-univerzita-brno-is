import EmptyState from "@/components/Common/EmptyState";
import SectionHeader from "@/components/Common/SectionHeader";
import SportsSection from "@/components/Sports/SportsSection";
import { getSports } from "@/lib/queries/sports";
import { splitSportsByType } from "@/components/Sports/sportUtils";

export default async function SportsPage() {
  const sports = await getSports();
  const { competitiveSports, recreationalSports } = splitSportsByType(sports);

  return (
    <div className="stack-page">
      <SectionHeader title="Sporty" as="h1" className="mb-4" />

      {sports.length === 0 ? (
        <EmptyState message="Zatím nejsou dostupné žádné sporty." />
      ) : (
        <div className="space-y-14">
          {competitiveSports.length > 0 ? (
            <SportsSection title="Soutěžní oddíly" sports={competitiveSports} />
          ) : null}
          {recreationalSports.length > 0 ? (
            <SportsSection title="Nesoutěžní oddíly" sports={recreationalSports} />
          ) : null}
        </div>
      )}
    </div>
  );
}
