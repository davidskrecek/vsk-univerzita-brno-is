import React, { Suspense } from "react";
import SectionHeader from "@/components/layout/SectionHeader";
import { getContacts } from "@/lib/queries/contacts";
import ContactsContent from "./ContactsContent";
import { PageReveal } from "@/components/layout/PageReveal";
import Loading from "@/app/loading";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import MiniSpinner from "@/components/ui/Feedback/MiniSpinner";
import { getRoles, Role } from "@/lib/queries/roles";
import { getSports, Sport } from "@/lib/queries/sports";
import { EditUserButton } from "@/components/features/admin/EditUserButton";

async function ContactsListContainer({ canEdit, sports, roles, isSuperAdmin, sport, showInactive }: { canEdit: boolean, sports: Sport[], roles: Role[], isSuperAdmin: boolean, sport?: string, showInactive: boolean }) {
  const allContacts = await getContacts(isSuperAdmin && showInactive);
  const filteredContacts = sport ? allContacts.filter(c => c.sportName === sport) : allContacts;

  return (
    <PageReveal>
      <ContactsContent
        initialContacts={filteredContacts}
        allAvailableContacts={allContacts}
        canEdit={canEdit}
        roles={roles}
        allSports={sports}
        isSuperAdmin={isSuperAdmin}
        currentSport={sport}
        currentShowInactive={showInactive}
      />
    </PageReveal>
  );
}

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ sport?: string; showInactive?: string }>;
}) {
  const { sport, showInactive } = await searchParams;
  const session = await getServerSession(authOptions);
  const isSuperAdmin = session?.user?.role === "superadmin";
  const canCreate = session?.user && (isSuperAdmin || session.user.role === "sport_manager");

  const roles = await getRoles();
  const sports = await getSports();

  return (
    <div className="stack-page">
      <SectionHeader title="Kontakty" as="h1" rightContent={
        canCreate ? (
          <Suspense fallback={<MiniSpinner />}>
            <EditUserButton label="Vytvořit kontakt" roles={roles} sports={sports} />
          </Suspense>
        ) : null
      } />
      <Suspense fallback={<Loading />}>
        <ContactsListContainer
          canEdit={canCreate ?? false}
          roles={roles}
          sports={sports}
          isSuperAdmin={isSuperAdmin}
          sport={sport}
          showInactive={showInactive === "true"}
        />
      </Suspense>
    </div>
  );
}

