"use client";

import { useMemo, useState } from "react";
import EmptyState from "@/components/Common/EmptyState";
import SectionHeader from "@/components/Common/SectionHeader";
import SportFilter from "@/components/Common/SportFilter/SportFilter";
import ContactSection from "@/components/Contacts/ContactSection";
import { buildContactSections, extractSports } from "@/components/Contacts/contactUtils";
import { ContactApiPerson } from "@/types/contacts";

const CONTACTS: ContactApiPerson[] = [
  {
    id: 1,
    firstName: "Petr",
    lastName: "Novák",
    role: "Prezident",
    roleGroup: "management",
    sportName: null,
    email: "novak@vskuniverzita.cz",
    phone: "+420 601 234 567",
    isActive: true,
  },
  {
    id: 2,
    firstName: "Jana",
    lastName: "Svobodová",
    role: "Tajemnice",
    roleGroup: "management",
    sportName: "TENIS",
    email: "svobodova@vskuniverzita.cz",
    phone: "+420 602 345 678",
    isActive: true,
  },
  {
    id: 3,
    firstName: "Lukáš",
    lastName: "Dvořák",
    role: "Hospodář",
    roleGroup: "management",
    sportName: null,
    email: "dvorak@vskuniverzita.cz",
    phone: "+420 603 456 789",
    isActive: true,
  },
  {
    id: 4,
    firstName: "Marek",
    lastName: "Veselý",
    role: "Hlavní trenér",
    roleGroup: "coaches",
    sportName: "VOLEJBAL",
    email: "vesely.vsk@vskuniverzita.cz",
    phone: "+420 721 111 222",
    isActive: true,
  },
  {
    id: 5,
    firstName: "Tomáš",
    lastName: "Kučera",
    role: "Juniorský trenér",
    roleGroup: "coaches",
    sportName: "BASKETBAL",
    email: "kucera.t@vskuniverzita.cz",
    phone: "+420 722 333 444",
    isActive: true,
  },
  {
    id: 6,
    firstName: "Alena",
    lastName: "Křížová",
    role: "Koordinátorka",
    roleGroup: "support",
    sportName: "FLORBAL",
    email: "krizova.a@vskuniverzita.cz",
    phone: "+420 723 555 666",
    isActive: true,
  },
  {
    id: 7,
    firstName: "Filip",
    lastName: "Němec",
    role: "Trenér přípravky",
    roleGroup: "coaches",
    sportName: "ATLETIKA",
    email: "nemec.f@vskuniverzita.cz",
    phone: "+420 724 777 888",
    isActive: true,
  },
];

const SPORTS = extractSports(CONTACTS);

export default function ContactsPage() {
  const [selectedSport, setSelectedSport] = useState<string | null>(null);

  const filteredSections = useMemo(() => {
    const activeContacts = selectedSport
      ? CONTACTS.filter((person) => !person.sportName || person.sportName === selectedSport)
      : CONTACTS;
    return buildContactSections(activeContacts);
  }, [selectedSport]);

  const visibleCount = filteredSections.reduce((sum, section) => sum + section.contacts.length, 0);

  return (
    <div className="stack-page">
      <SectionHeader title="Kontakty" as="h1" />

      <SportFilter
        sports={SPORTS}
        selectedSport={selectedSport}
        onSportChange={setSelectedSport}
      />

      {visibleCount === 0 ? (
        <EmptyState message="Pro vybraný sport nebyly nalezeny žádné kontakty." />
      ) : (
        filteredSections.map((section) => (
          <ContactSection key={section.id} title={section.title} contacts={section.contacts} />
        ))
      )}
    </div>
  );
}

