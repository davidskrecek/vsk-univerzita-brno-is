import { Suspense } from "react";
import SectionHeader from "@/components/Common/SectionHeader";
import { getActiveContacts } from "@/lib/queries/contacts";
import ContactsContent from "./ContactsContent";
import { PageReveal } from "@/components/Common/PageReveal";
import Loading from "@/app/loading";

async function ContactsListContainer() {
  const contacts = await getActiveContacts();
  return (
    <PageReveal>
      <ContactsContent initialContacts={contacts} />
    </PageReveal>
  );
}

export default function ContactsPage() {
  return (
    <div className="stack-page">
      <SectionHeader title="Kontakty" as="h1" />
      <Suspense fallback={<Loading />}>
        <ContactsListContainer />
      </Suspense>
    </div>
  );
}
