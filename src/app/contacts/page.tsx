import React, { Suspense } from "react";
import SectionHeader from "@/components/layout/SectionHeader";
import { getContacts } from "@/lib/queries/contacts";
import ContactsContent from "./ContactsContent";
import { PageReveal } from "@/components/layout/PageReveal";
import Loading from "@/app/loading";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Spinner from "@/components/ui/Feedback/Spinner";
import { getRoles, Role } from "@/lib/queries/roles";
import { EditUserButton } from "@/components/features/admin/EditUserButton";

async function ContactsListContainer({ roles, isSuperAdmin, sport, showInactive }: { roles: Role[], isSuperAdmin: boolean, sport?: string, showInactive: boolean }) {
  const allContacts = await getContacts(isSuperAdmin && showInactive);
  const filteredContacts = sport ? allContacts.filter(c => c.sportName === sport) : allContacts;

  return (
    <PageReveal>
      <ContactsContent
        initialContacts={filteredContacts}
        roles={roles}
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

  return (
    <div className="stack-page">
      <SectionHeader title="Kontakty" as="h1" rightContent={
        canCreate ? (
          <Suspense fallback={<Spinner />}>
            <EditUserButton label="Vytvořit kontakt" roles={roles} />
          </Suspense>
        ) : null
      } />
      <Suspense fallback={<Loading />}>
        <ContactsListContainer
          roles={roles}
          isSuperAdmin={isSuperAdmin}
          sport={sport}
          showInactive={showInactive === "true"}
        />
      </Suspense>
    </div>
  );
}


