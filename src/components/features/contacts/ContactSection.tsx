import ContactCard from "@/components/features/contacts/ContactCard";
import { ContactPerson } from "@/types/contacts";
import {Role} from "@/lib/queries/roles";

interface ContactSectionProps {
  title: string;
  contacts: ContactPerson[];
  roles: Role[];
  user: { role?: string | null; managedSportIds?: number[] | null } | null | undefined;
}

export const ContactSection = ({ title, contacts, roles, user }: ContactSectionProps) => {
  if (contacts.length === 0) {
    return null;
  }

  const checkCanEdit = (contact: ContactPerson) => {
    if (!user) return false;
    if (user.role === "superadmin") return true;
    if (user.role === "sport_manager") {
      return contact.sportId !== null && user.managedSportIds?.includes(contact.sportId);
    }
    return false;
  };

  return (
    <section className="stack-section">
      <div className="border-l-4 border-primary pl-6">
        <h2 className="text-[11px] font-display font-bold uppercase tracking-widest text-on-surface/70 leading-none">
          {title}
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {contacts.map((contact) => (
          <ContactCard 
            key={contact.id} 
            contact={contact} 
            canEdit={checkCanEdit(contact)} 
            roles={roles} 
            isSuperAdmin={user?.role === "superadmin"}
          />
        ))}
      </div>
    </section>
  );
};

export default ContactSection;


