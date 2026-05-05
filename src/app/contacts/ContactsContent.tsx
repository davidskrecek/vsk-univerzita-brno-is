"use client";

import { useMemo, useState } from "react";
import EmptyState from "@/components/Common/EmptyState";
import SportFilter from "@/components/Common/SportFilter/SportFilter";
import ContactSection from "@/components/Contacts/ContactSection";
import {
  buildContactSections,
  extractSports,
  type ContactItem,
} from "@/components/Contacts/contactUtils";

interface ContactsContentProps {
  initialContacts: ContactItem[];
}

export default function ContactsContent({ initialContacts }: ContactsContentProps) {
  const contacts = initialContacts;
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
      <SportFilter
        sports={sports}
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
