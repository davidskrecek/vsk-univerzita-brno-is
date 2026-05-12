import { type ContactItem, type ContactPerson, type ContactSectionData } from "@/types/contacts";

export type { ContactItem, ContactPerson, ContactSectionData };

const GROUP_TITLES: Record<string, string> = {
  management: "Vedení klubu",
  coaches: "Trenéři",
  support: "Podpora",
  other: "Ostatní kontakty",
};

const inferGroupFromRole = (role: string) => {
  const normalized = role.toLowerCase();

  if (normalized.includes("tren")) return "coaches";
  if (
    normalized.includes("prezident") ||
    normalized.includes("tajem") ||
    normalized.includes("hospod") ||
    normalized.includes("vedouc")
  ) {
    return "management";
  }

  return "other";
};

export const toContactPerson = (person: ContactItem): ContactPerson => ({
  id: String(person.id),
  name: `${person.firstName} ${person.lastName}`.trim(),
  role: person.role,
  sport: person.sportName ?? "VŠE",
  sportId: person.sportId,
  email: person.email,
  phone: person.phone,
  isActive: person.isActive ?? true,
});

export const buildContactSections = (people: ContactItem[]): ContactSectionData[] => {
  const grouped = people.reduce<Record<string, ContactItem[]>>((acc, person) => {
    const key = person.roleGroup?.trim().toLowerCase() || inferGroupFromRole(person.role);
    if (!acc[key]) acc[key] = [];
    acc[key].push(person);
    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([group, members]) => ({
      id: group,
      title: GROUP_TITLES[group] ?? group,
      contacts: members.map(toContactPerson),
    }))
    .sort((a, b) => a.title.localeCompare(b.title, "cs"));
};

export const extractSports = (people: ContactItem[]) => {
  const presentSportIds = new Set(people.map(p => p.sportId).filter(id => id !== null));
  return presentSportIds;
};

