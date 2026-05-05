import SectionHeader from "@/components/Common/SectionHeader";
import { getActiveContacts } from "@/lib/queries/contacts";
import ContactsContent from "./ContactsContent";

export default async function ContactsPage() {
  const contacts = await getActiveContacts();

  return (
    <div className="stack-page">
      <SectionHeader title="Kontakty" as="h1" />
      <ContactsContent initialContacts={contacts} />
    </div>
  );
}
