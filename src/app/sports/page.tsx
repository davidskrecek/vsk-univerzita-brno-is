"use client";

import EmptyState from "@/components/Common/EmptyState";
import SectionHeader from "@/components/Common/SectionHeader";
import SportsSection from "@/components/Sports/SportsSection";
import { useSportsPageData } from "@/hooks/useSportsPageData";

export default function SportsPage() {
  const { loading, error, sports, competitiveSports, recreationalSports } = useSportsPageData();

  return (
    <div className="stack-page">
      <SectionHeader title="Sporty" as="h1" className="mb-4" />

      {loading ? (
        <p className="text-sm font-sans text-on-surface/60">Načítání sportů...</p>
      ) : error ? (
        <EmptyState message={error} />
      ) : sports.length === 0 ? (
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

