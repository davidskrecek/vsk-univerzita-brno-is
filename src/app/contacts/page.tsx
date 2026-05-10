import React, { Suspense } from "react";
import SectionHeader from "@/components/Common/SectionHeader";
import { getActiveContacts } from "@/lib/queries/contacts";
import ContactsContent from "./ContactsContent";
import { PageReveal } from "@/components/Common/PageReveal";
import Loading from "@/app/loading";
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";
import MiniSpinner from "@/components/Common/MiniSpinner";
import {getRoles, Role} from "@/lib/queries/roles";
import {getSports, Sport} from "@/lib/queries/sports";
import {UserFormModalButton} from "@/components/Common/UserFormModalButtonProps";

async function ContactsListContainer({canEdit, sports, roles}: {canEdit: boolean, sports: Sport[], roles: Role[]}) {
  const contacts = await getActiveContacts();
  return (
    <PageReveal>
      <ContactsContent initialContacts={contacts} canEdit={canEdit} roles={roles} allSports={sports}/>
    </PageReveal>
  );
}

export default async function ContactsPage() {
    const session = await getServerSession(authOptions);
   const canCreate = session?.user && (session.user.role === "superadmin" || session.user.role === "sport_manager");

    const roles = await getRoles();
    const sports = await getSports();

  return (
    <div className="stack-page">
      <SectionHeader title="Kontakty" as="h1" rightContent={
        canCreate ? (
            <Suspense fallback={<MiniSpinner/>}>
                <UserFormModalButton label="Vytvořit uživatele" roles={roles} sports={sports}/>
            </Suspense>
        ) : null
      }/>
      <Suspense fallback={<Loading />}>
        <ContactsListContainer canEdit={canCreate ?? false} roles={roles} sports={sports} />
      </Suspense>
    </div>
  );
}
