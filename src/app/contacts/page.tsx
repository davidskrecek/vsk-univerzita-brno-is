import { getActiveContacts } from "@/lib/queries/contacts";
import ContactsContent from "./ContactsContent";

export default async function ContactsPage() {
  const contacts = await getActiveContacts();

  return <ContactsContent initialContacts={contacts} />;
}
