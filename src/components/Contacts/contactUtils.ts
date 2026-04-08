import { ContactApiPerson, ContactPerson, ContactSectionData } from "@/types/contacts";

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

export const toContactPerson = (person: ContactApiPerson): ContactPerson => ({
  id: String(person.id),
  name: `${person.firstName} ${person.lastName}`.trim(),
  role: person.role,
  sport: person.sportName ?? "VŠE",
  email: person.email,
  phone: person.phone,
});

export const buildContactSections = (people: ContactApiPerson[]): ContactSectionData[] => {
  const grouped = people.reduce<Record<string, ContactApiPerson[]>>((acc, person) => {
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

export const extractSports = (people: ContactApiPerson[]) =>
  Array.from(
    new Set(
      people
        .map((person) => person.sportName)
        .filter((sport): sport is string => Boolean(sport && sport.trim()))
    )
  ).sort((a, b) => a.localeCompare(b, "cs"));

