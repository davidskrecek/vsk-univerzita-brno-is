import React, { Suspense } from "react";
import SectionHeader from "@/components/Common/SectionHeader";
import { getActiveContacts } from "@/lib/queries/contacts";
import ContactsContent from "./ContactsContent";
import { PageReveal } from "@/components/Common/PageReveal";
import Loading from "@/app/loading";
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";
import MiniSpinner from "@/components/Common/MiniSpinner";
import {CreateUserFormButton} from "@/components/Common/CreateUserFormButton";
import {getRoles} from "@/lib/queries/roles";

async function ContactsListContainer() {
  const contacts = await getActiveContacts();
  return (
    <PageReveal>
      <ContactsContent initialContacts={contacts} />
    </PageReveal>
  );
}

export default async function ContactsPage() {
   const session = await getServerSession(authOptions);
   const canCreate = session?.user && (session.user.role === "superadmin" || session.user.role === "sport_manager");

   const roles = await getRoles();

  return (
    <div className="stack-page">
      <SectionHeader title="Kontakty" as="h1" rightContent={
        canCreate ? (
            <Suspense fallback={<MiniSpinner/>}>
                <CreateUserFormButton label="Vytvořit uživatele" roles={roles}/>
            </Suspense>
        ) : null
      }/>
      <Suspense fallback={<Loading />}>
        <ContactsListContainer />
      </Suspense>
    </div>
  );
}
