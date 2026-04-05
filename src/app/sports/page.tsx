import SectionHeader from "@/components/Common/SectionHeader";
import SportsSection from "@/components/Sports/SportsSection";

const COMPETITIVE_SPORTS = [
  "Volejbal",
  "Basketbal",
  "Házená",
  "Futsal",
  "Tenis",
  "Vzpírání",
  "Plavání",
  "Atletika",
  "Veslování",
  "Judo"
];

const RECREATIONAL_SPORTS = ["Jóga", "Turistika", "Lyžování", "Rekreační plavání", "Cyklistika"];

export default function SportsPage() {
  return (
    <div className="stack-page">
      <SectionHeader title="Sporty" as="h1" className="mb-4" />

      <div className="space-y-14">
        <SportsSection title="Soutěžní oddíly" sports={COMPETITIVE_SPORTS} />
        <SportsSection title="Nesoutěžní oddíly" sports={RECREATIONAL_SPORTS} />
      </div>
    </div>
  );
}

