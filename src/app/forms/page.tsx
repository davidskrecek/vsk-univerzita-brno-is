import SectionHeader from "@/components/Common/SectionHeader";
import OrderSection from "@/components/Forms/OrderSection";
import { PageReveal } from "@/components/Common/PageReveal";

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
