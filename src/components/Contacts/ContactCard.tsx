"use client";

import { Mail, Phone } from "lucide-react";
import { ContactPerson } from "@/types/contacts";

interface ContactCardProps {
  contact: ContactPerson;
}

export const ContactCard = ({ contact }: ContactCardProps) => {
  return (
    <article className="relative rounded-md border border-outline-variant/10 bg-surface-container-low p-5 shadow-ambient transition-colors hover:bg-surface-container">
      <span className="meta-badge absolute top-4 right-4">
        {contact.sport}
      </span>

      <h3 className="pr-20 text-lg font-display font-bold leading-tight text-on-surface">
        {contact.name}
      </h3>
      <p className="meta-caption mt-1">
        {contact.role}
      </p>

      <div className="mt-5 space-y-2 text-sm text-on-surface/70">
        <a
          href={`mailto:${contact.email}`}
          className="group flex items-center gap-2.5 transition-colors hover:text-primary"
        >
          <Mail size={14} className="text-primary/70 transition-colors group-hover:text-primary" />
          <span className="truncate">{contact.email}</span>
        </a>
        {contact.phone ? (
          <a
            href={`tel:${contact.phone.replace(/\s+/g, "")}`}
            className="group flex items-center gap-2.5 transition-colors hover:text-primary"
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
};

export default ContactCard;

