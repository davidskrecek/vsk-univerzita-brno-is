import SectionHeader from "@/components/Common/SectionHeader";

export default function SportsLoading() {
  return (
    <div className="stack-page">
      <SectionHeader title="Sporty" as="h1" className="mb-4" />
      <p className="text-sm font-sans text-on-surface/60">Načítání sportů...</p>
    </div>
  );
}
