"use client";

import { useMemo, useState } from "react";
import OrderSteps from "@/components/Forms/OrderSteps";
import PartnerOrderForm from "@/components/Forms/PartnerOrderForm";
import PartnerGuide from "@/components/Forms/PartnerGuide";
import { useToast } from "@/hooks/useToast";
import { submitOrder } from "@/actions/submitOrder";

interface OrderSectionProps {
  partners: Array<{ id: string; name: string }>;
}

export const OrderSection = ({ partners }: OrderSectionProps) => {
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const partnersById = useMemo(() => new Map(partners.map((partner) => [partner.id, partner.name])), [partners]);

  const guides = useMemo<Record<string, string>>(
    () => ({
      nutrend: "Vyplňte objednávku do formuláře a uveďte přesné názvy produktů a množství.\nDoporučujeme přidat i příchuť/variantu, pokud existuje.",
      top4running: "Uveďte název, číslo produktu, velikost a počet kusů.\n Např.:ASICS Superblast 3, 1013A177-400, vel. 40, 2 ks",
      zinzino: "Uveďte název balíčku a případné doplňky. Pokud je relevantní, připište i preferovaný způsob doručení.",
      atex: "Specifikujte produkty, velikosti a barvy. Pokud máte k dispozici katalogové kódy, uveďte je.",
      "o-nemec": "Uveďte přesné označení položek a množství. Pokud objednáváte více variant, rozdělte je po řádcích pro přehlednost.",
      onemec: "Uveďte název, velikost a počet kusů.\nNapř.:ASICS SUPERBLAST 3 400, 40, 2 ks"
    }),
    []
  );

  const steps = useMemo(
    () => [
      {
        title: "Výběr partnera",
        description: "Vyberte značku z našeho seznamu partnerů.",
      },
      {
        title: "Specifikace",
        description: "Do detailů objednávky uveďte parametry. Informace potřebné pro správné zpracování objednávky naleznete pod formulářem po výběru partnera.",
      },
      {
        title: "Potvrzení",
        description: "Na zadaný e-mail odešleme potvrzení o přijetí objednávky. E-mail slouží také ke komunikaci ohledně termínu vyzvednutí.",
      },
      {
        title: "Odběr",
        description: "Budeme vás informovat o doručení a o možnosti vyzvednutí objednávky.",
      },
    ],
    []
  );

  const handleSubmit = async (draft: {
    partnerId: string;
    fullName: string;
    phone: string;
    email: string;
    details: string;
  }) => {
    const partnerName = partnersById.get(draft.partnerId);
    if (!partnerName) {
      toast.error("Vybraný partner nebyl nalezen.");
      return;
    }

    setIsSubmitting(true);

    try {
      const contactsResponse = await fetch(`/api/contacts?search=${encodeURIComponent(draft.email)}`, {
        cache: "no-store",
      });

      if (!contactsResponse.ok) {
        throw new Error(`Nepodařilo se ověřit kontakt (${contactsResponse.status})`);
      }

      const contacts = (await contactsResponse.json()) as Array<{ id: number; email: string }>;
      const requester = contacts.find(
        (person) => person.email.trim().toLowerCase() === draft.email.trim().toLowerCase()
      );

      if (!requester) {
        toast.warning("Kontakt s tímto e-mailem nebyl v adresáři nalezen.");
        return;
      }

      const detailsWithContact = `${draft.details}\n\nKontaktní osoba: ${draft.fullName}\nTelefon: ${draft.phone}`;

      await submitOrder({
        partnerName,
        email: draft.email,
        details: detailsWithContact,
        requesterPersonnelId: requester.id,
      });

      toast.success("Objednávka byla odeslána.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Objednávku se nepodařilo odeslat.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="space-y-6 sm:space-y-8">
      <div className="border-l-4 border-primary pl-6 space-y-3">
        <h1 className="text-3xl sm:text-4xl font-display font-bold uppercase tracking-display text-on-surface leading-none">
          Objednávka
        </h1>
        <p className="text-sm font-sans text-on-surface/40 leading-relaxed max-w-2xl">
          Využijte členských slev u našich partnerů. Objednávky jsou zpracovávány hromadně v pravidelných cyklech.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-10 items-start">
        <div className="space-y-8">
          <OrderSteps steps={steps} />
          <div className="bg-surface-container-low rounded-xl border border-outline-variant/10 p-6">
            <div className="text-caption font-display font-bold uppercase tracking-widest text-on-surface/60 mb-2">
              Poznámka
            </div>
            <div className="text-xs font-sans text-on-surface/40 leading-relaxed">
              Pokud objednáváte produkt pro své dítě, doporučujeme vyplnit jméno a příjmení dítěte.
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <PartnerOrderForm
            partners={partners}
            onPartnerChange={setSelectedPartner}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
          <PartnerGuide partner={selectedPartner} guides={guides} />
        </div>
      </div>
    </section>
  );
};

export default OrderSection;
