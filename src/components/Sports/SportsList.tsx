import EmptyState from "@/components/Common/EmptyState";
import SportsSection from "@/components/Sports/SportsSection";
import { splitSportsByType } from "@/components/Sports/sportUtils";

interface Sport {
  id: number;
  name: string;
  isCompetitive: boolean;
  description: string | null;
}

export default function SportsList({ sports }: { sports: Sport[] }) {
  const { competitiveSports, recreationalSports } = splitSportsByType(sports);

  if (sports.length === 0) {
    return <EmptyState message="Zatím nejsou dostupné žádné sporty." />;
  }

  return (
    <div className="space-y-14">
      {competitiveSports.length > 0 && (
        <SportsSection title="Soutěžní oddíly" sports={competitiveSports} />
      )}
      {recreationalSports.length > 0 && (
        <SportsSection title="Nesoutěžní oddíly" sports={recreationalSports} />
      )}
    </div>
  );
}
