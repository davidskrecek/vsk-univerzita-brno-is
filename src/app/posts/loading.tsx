import SectionHeader from "@/components/Common/SectionHeader";

export default function PostsLoading() {
  return (
    <div className="stack-page">
      <SectionHeader title="Příspěvky" as="h1" />
      <p className="text-sm font-sans text-on-surface/60">Načítání příspěvků...</p>
    </div>
  );
}
