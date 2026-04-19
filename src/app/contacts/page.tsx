"use client";

import { useMemo, useState } from "react";
import EmptyState from "@/components/Common/EmptyState";
import SectionHeader from "@/components/Common/SectionHeader";
import SportFilter from "@/components/Common/SportFilter/SportFilter";
import ContactSection from "@/components/Contacts/ContactSection";
import {
  buildContactSections,
  extractSports,
  mapContactsApiResponseToContactApiPeople,
  type ContactApiResponseItem,
} from "@/components/Contacts/contactUtils";
import { ContactApiPerson } from "@/types/contacts";
import { useApiData } from "@/hooks/useApiData";

export default function ContactsPage() {
  const { data, loading, error } = useApiData<ContactApiResponseItem[], ContactApiPerson[]>({
    url: "/api/contacts",
    errorMessage: "Nepodařilo se načíst kontakty",
    mapData: mapContactsApiResponseToContactApiPeople,
  });
  const contacts = useMemo(() => data ?? [], [data]);
  const [selectedSport, setSelectedSport] = useState<string | null>(null);

  const sports = useMemo(() => extractSports(contacts), [contacts]);

  const filteredSections = useMemo(() => {
    const activeContacts = selectedSport
      ? contacts.filter((person) => !person.sportName || person.sportName === selectedSport)
      : contacts;
    return buildContactSections(activeContacts);
  }, [contacts, selectedSport]);

  const visibleCount = filteredSections.reduce((sum, section) => sum + section.contacts.length, 0);

  return (
    <div className="stack-page">
      <SectionHeader title="Kontakty" as="h1" />

      <SportFilter
        sports={sports}
        selectedSport={selectedSport}
        onSportChange={setSelectedSport}
      />

      {loading ? (
        <p className="text-sm font-sans text-on-surface/60">Načítání kontaktů...</p>
      ) : error ? (
        <EmptyState message={error} />
      ) : visibleCount === 0 ? (
        <EmptyState message="Pro vybraný sport nebyly nalezeny žádné kontakty." />
      ) : (
        filteredSections.map((section) => (
          <ContactSection key={section.id} title={section.title} contacts={section.contacts} />
        ))
      )}
    </div>
  );
}

