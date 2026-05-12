"use client";

import {Mail, Phone} from "lucide-react";
import { ContactPerson } from "@/types/contacts";
import {EditUserButton} from "@/components/features/admin/EditUserButton";
import {Role} from "@/lib/queries/roles";
interface ContactCardProps {
  contact: ContactPerson;
  canEdit: boolean;
  roles: Role[];
  isSuperAdmin?: boolean;
}

export const ContactCard = ({ contact, canEdit, roles, isSuperAdmin }: ContactCardProps) => {

  const cardContent = (
    <article className={`relative rounded-md border border-outline-variant/10 bg-surface-container-low p-5 shadow-ambient transition-all hover:bg-surface-container ${!contact.isActive ? "opacity-50 grayscale-[0.5]" : ""}`}>
      <span className="meta-badge absolute top-4 right-4">
        {contact.sport}
      </span>

      <h3 className="pr-20 text-lg font-display font-bold leading-tight text-on-surface">
        {contact.name}
      </h3>
      {isSuperAdmin && (
        <p className="meta-caption mt-1">
          {contact.role}
        </p>
      )}

      <div className="mt-5 space-y-2 text-sm text-on-surface/70">
        <a
          href={`mailto:${contact.email}`}
          onClick={(e) => e.stopPropagation()}
          className="group flex items-center gap-2.5 transition-colors hover:text-primary w-fit"
        >
          <Mail size={14} className="text-primary/70 transition-colors group-hover:text-primary" />
          <span className="truncate">{contact.email}</span>
        </a>
        {contact.phone ? (
          <a
            href={`tel:${contact.phone.replace(/\s+/g, "")}`}
            onClick={(e) => e.stopPropagation()}
            className="group flex items-center gap-2.5 transition-colors hover:text-primary w-fit"
          >
            <Phone size={14} className="text-primary/70 transition-colors group-hover:text-primary" />
            <span>{contact.phone}</span>
          </a>
        ) : (
          <div className="flex items-center gap-2.5 text-on-surface/35">
            <Phone size={14} className="text-primary/40" />
            <span>Telefon neuveden</span>
          </div>
        )}
      </div>
    </article>
  );

  if (canEdit) {
    return (
        <EditUserButton userId={contact.id} roles={roles}>
            {cardContent}
        </EditUserButton>
    );
  }

  return cardContent;
};

export default ContactCard;


