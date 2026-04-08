import SportTile from "@/components/Sports/SportTile";

export interface SportsSectionProps {
  title: string;
  sports: string[];
  className?: string;
}

export const SportsSection = ({ title, sports, className = "" }: SportsSectionProps) => {
  return (
    <section className={`space-y-6 ${className}`}>
      <div className="border-l-4 border-primary pl-6">
        <h2 className="text-[11px] font-display font-bold uppercase tracking-widest text-on-surface/70 leading-none">
          {title}
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {sports.map((sport) => (
          <SportTile key={sport} name={sport} />
        ))}
      </div>
    </section>
  );
};

export default SportsSection;
