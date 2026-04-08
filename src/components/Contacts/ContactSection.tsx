import ContactCard from "@/components/Contacts/ContactCard";
import { ContactPerson } from "@/types/contacts";

interface ContactSectionProps {
  title: string;
  contacts: ContactPerson[];
}

export const ContactSection = ({ title, contacts }: ContactSectionProps) => {
  if (contacts.length === 0) {
    return null;
  }

  return (
    <section className="stack-section">
      <div className="border-l-4 border-primary pl-4 sm:pl-5">
        <h2 className="text-2xl font-display font-bold uppercase tracking-display text-on-surface sm:text-3xl">
          {title}
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {contacts.map((contact) => (
          <ContactCard key={contact.id} contact={contact} />
        ))}
      </div>
    </section>
  );
};

export default ContactSection;

