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
import {getSports} from "@/lib/queries/sports";

async function ContactsListContainer() {
  const contacts = await getActiveContacts();
  return (
    <PageReveal>
      <ContactsContent initialContacts={contacts} />
    </PageReveal>
  );
}

async function GetUserFormButton() {
    const roles = await getRoles();
    const sports = await getSports();

    return (
        <Suspense fallback={<MiniSpinner/>}>
            <CreateUserFormButton label="Vytvořit uživatele" roles={roles} sports={sports}/>
        </Suspense>
    );
}

export default async function ContactsPage() {
    const session = await getServerSession(authOptions);
   const canCreate = session?.user && (session.user.role === "superadmin" || session.user.role === "sport_manager");

  return (
    <div className="stack-page">
      <SectionHeader title="Kontakty" as="h1" rightContent={
        canCreate ? (
            <GetUserFormButton/>
        ) : null
      }/>
      <Suspense fallback={<Loading />}>
        <ContactsListContainer />
      </Suspense>
    </div>
  );
}
