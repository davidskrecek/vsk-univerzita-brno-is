"use client";

import OrderSection from "@/components/Forms/OrderSection";

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
      <OrderSection partners={PARTNERS} />
    </div>
  );
}
