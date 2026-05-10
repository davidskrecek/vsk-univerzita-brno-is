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
import {Sport} from "@/lib/queries/sports";
import {Role} from "@/lib/queries/roles";

interface ContactsContentProps {
  initialContacts: ContactItem[];
  canEdit: boolean;
  roles: Role[];
  allSports: Sport[];
}

export default function ContactsContent({ initialContacts, canEdit, roles, allSports }: ContactsContentProps) {
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
    <div className="flex flex-col gap-8">
      <SportFilter
        sports={sports}
        selectedSport={selectedSport}
        onSportChange={setSelectedSport}
      />

      {visibleCount === 0 ? (
        <EmptyState message="Pro vybraný sport nebyly nalezeny žádné kontakty." />
      ) : (
        filteredSections.map((section) => (
          <ContactSection key={section.id} title={section.title} contacts={section.contacts} canEdit={canEdit} roles={roles} sports={allSports} />
        ))
      )}
    </div>
  );
}
