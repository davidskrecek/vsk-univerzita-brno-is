import SectionHeader from "@/components/layout/SectionHeader";
import OrderSection from "@/components/features/partners/OrderSection";
import { PageReveal } from "@/components/layout/PageReveal";

const PARTNERS = [
  { id: "nutrend", name: "Nutrend" },
  { id: "top4running", name: "Top4Running" },
  { id: "zinzino", name: "Zinzino" },
  { id: "atex", name: "Atex" },
  { id: "o-nemec", name: "O-Němec" },
];

export default function FormsPage() {
  return (
    <div className="stack-page">
      <SectionHeader
        title="Objednávka"
        as="h1"
      />
      
      <PageReveal>
        <OrderSection partners={PARTNERS} hideHeader />
      </PageReveal>
    </div>
  );
}

