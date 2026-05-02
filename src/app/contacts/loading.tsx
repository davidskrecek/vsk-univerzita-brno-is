import SectionHeader from "@/components/Common/SectionHeader";

export default function ContactsLoading() {
  return (
    <div className="stack-page">
      <SectionHeader title="Kontakty" as="h1" />
      <p className="text-sm font-sans text-on-surface/60">Načítání kontaktů...</p>
    </div>
  );
}
