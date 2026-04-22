import OtherTile from "./OtherTile";

export interface OtherSectionProps {
  title: string;
  items: { name: string; href?: string }[];
  className?: string;
}

export const OtherSection = ({ title, items, className = "" }: OtherSectionProps) => {
  return (
    <section className={`space-y-6 ${className}`}>
      <div className="border-l-4 border-primary pl-6">
        <h2 className="text-[11px] font-display font-bold uppercase tracking-widest text-on-surface/70 leading-none">
          {title}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((item) => (
          <OtherTile key={item.name} name={item.name} href={item.href} />
        ))}
      </div>
    </section>
  );
};

export default OtherSection;
