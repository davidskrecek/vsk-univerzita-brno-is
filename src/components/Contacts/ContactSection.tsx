import ContactCard from "@/components/Contacts/ContactCard";
import { ContactPerson } from "@/types/contacts";
import {Role} from "@/lib/queries/roles";
import {Sport} from "@/lib/queries/sports";

interface ContactSectionProps {
  title: string;
  contacts: ContactPerson[];
  canEdit: boolean;
  roles: Role[];
  sports: Sport[];
}

export const ContactSection = ({ title, contacts, canEdit, roles, sports }: ContactSectionProps) => {
  if (contacts.length === 0) {
    return null;
  }

  return (
    <section className="stack-section">
      <div className="border-l-4 border-primary pl-6">
        <h2 className="text-[11px] font-display font-bold uppercase tracking-widest text-on-surface/70 leading-none">
          {title}
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {contacts.map((contact) => (
          <ContactCard key={contact.id} contact={contact} canEdit={canEdit} roles={roles} sports={sports} />
        ))}
      </div>
    </section>
  );
};

export default ContactSection;

