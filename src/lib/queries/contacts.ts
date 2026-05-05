import "server-only";
import { prisma } from "@/lib/prisma";
import type { ContactItem } from "@/components/Contacts/contactUtils";

export async function getActiveContacts(): Promise<ContactItem[]> {
  const contacts = await prisma.personnel.findMany({
    where: { isActive: true },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      sport: { select: { id: true, name: true } },
      trainer: { select: { category: true } },
      official: { select: { position: true } },
    },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  return contacts.map((person) => ({
    id: person.id,
    firstName: person.firstName,
    lastName: person.lastName,
    email: person.email,
    phone: person.phone,
    sportName: person.sport?.name ?? null,
    role: person.trainer
      ? person.trainer.category
        ? `Trenér (${person.trainer.category})`
        : "Trenér"
      : person.official?.position ?? "Člen klubu",
    roleGroup: person.trainer
      ? "coaches"
      : person.official
      ? "management"
      : "other",
    isActive: true,
  }));
}
