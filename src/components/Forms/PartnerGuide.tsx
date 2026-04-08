interface PartnerGuideProps {
  partner: string | null;
  guides: Record<string, string>;
}

export const PartnerGuide = ({ partner, guides }: PartnerGuideProps) => {
  const content = partner ? guides[partner] : null;

  return (
    <section className="bg-surface-container-low rounded-xl border border-outline-variant/10 p-8">
      <div className="text-[10px] font-display font-bold uppercase tracking-widest text-on-surface/60 mb-2">
        Návod pro vybraného partnera
      </div>
      {partner && content ? (
        <div className="text-sm font-sans text-on-surface/50 leading-relaxed whitespace-pre-line">
          {content}
        </div>
      ) : (
        <div className="text-sm font-sans text-on-surface/40 italic">
          Vyberte partnera pro zobrazení instrukcí k objednávce.
        </div>
      )}
    </section>
  );
};

export default PartnerGuide;
