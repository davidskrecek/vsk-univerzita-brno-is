"use client";

import { useTransition, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import ViewToggle from "@/components/ui/Actions/ViewToggle";
import SportFilter from "@/components/ui/Filters/SportFilter";
import ContactSection from "@/components/features/contacts/ContactSection";
import EmptyState from "@/components/ui/Feedback/EmptyState";
import { useSports } from "@/components/features/sports/SportsProvider";
import {
  buildContactSections,
  extractSports,
  type ContactItem,
} from "@/components/features/contacts/contactUtils";
import { Role } from "@/lib/queries/roles";

interface ContactsContentProps {
  initialContacts: ContactItem[];
  allAvailableContacts: ContactItem[];
  canEdit: boolean;
  isSuperAdmin: boolean;
  roles: Role[];
  currentSport?: string;
  currentShowInactive: boolean;
}

export default function ContactsContent({
  initialContacts,
  allAvailableContacts,
  canEdit,
  isSuperAdmin,
  roles,
  currentSport,
  currentShowInactive
}: ContactsContentProps) {
  const { sports: allSports } = useSports();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const { data: session } = useSession();

  const updateFilters = useCallback((sportName: string | null, showInactive: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    if (sportName) {
      params.set("sport", sportName);
    } else {
      params.delete("sport");
    }

    if (showInactive) {
      params.set("showInactive", "true");
    } else {
      params.delete("showInactive");
    }

    startTransition(() => {
      router.push(`?${params.toString()}`, { scroll: false });
    });
  }, [router, searchParams]);

  const sortedSports = useMemo(() =>
    [...allSports].sort((a, b) => a.name.localeCompare(b.name, "cs")),
    [allSports]
  );

  const sections = useMemo(() => buildContactSections(initialContacts), [initialContacts]);
  const visibleCount = sections.reduce((sum, section) => sum + section.contacts.length, 0);

  return (
    <div className={`flex flex-col gap-8 transition-opacity duration-300 ${isPending ? "opacity-50" : "opacity-100"}`}>
      <div className="flex flex-row flex-wrap justify-between gap-6">
        <SportFilter
          sports={sortedSports}
          selectedSport={currentSport || null}
          onSportChange={(sport) => updateFilters(sport, currentShowInactive)}
        />

        {isSuperAdmin && (
          <ViewToggle
            options={[
              { id: "active", label: "Aktivní" },
              { id: "all", label: "Všechny" },
            ]}
            activeId={currentShowInactive ? "all" : "active"}
            onChange={(id) => updateFilters(currentSport || null, id === "all")}
          />
        )}
      </div>

      {visibleCount === 0 ? (
        <EmptyState message="Pro vybraný sport nebyly nalezeny žádné kontakty." />
      ) : (
        sections.map((section) => (
          <ContactSection
            key={section.id}
            title={section.title}
            contacts={section.contacts}
            roles={roles}
            user={session?.user}
          />
        ))
      )}
    </div>
  );
}

