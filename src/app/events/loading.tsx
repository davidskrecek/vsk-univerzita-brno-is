import SectionHeader from "@/components/Common/SectionHeader";

export default function EventsLoading() {
  return (
    <div className="stack-page">
      <SectionHeader title="Kalendář akcí" as="h1" />
      <p className="text-sm font-sans text-on-surface/60">Načítání akcí...</p>
    </div>
  );
}
