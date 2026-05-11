import "server-only";
import { prisma } from "@/lib/prisma";
import type { ContactItem } from "@/components/features/contacts/contactUtils";

export async function getContacts(includeInactive = false, sport?: string): Promise<ContactItem[]> {
  const contacts = await prisma.personnel.findMany({
    where: {
      ...(includeInactive ? {} : { isActive: true }),
      ...(sport ? { sport: { name: sport } } : {}),
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      sport: { select: { id: true, name: true } },
      trainer: { select: { category: true } },
      official: { select: { position: true } },
      isActive: true,
      editor: {
        include: {
          editorRole: true
        }
      }
    },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  return contacts.map((person) => {
    let role = "Člen klubu";
    let roleGroup = "other";

    if (person.editor?.editorRole?.name === "superadmin") {
        role = "Superadmin";
        roleGroup = "management";
    } else if (person.editor?.editorRole?.name === "sport_manager") {
        role = "Správce sportu";
        roleGroup = "management";
    } else if (person.editor?.editorRole?.name === "editor") {
        role = "Editor";
        roleGroup = "management";
    } else if (person.trainer) {
        role = person.trainer.category ? `Trenér (${person.trainer.category})` : "Trenér";
        roleGroup = "coaches";
    } else if (person.official) {
        role = person.official.position;
        roleGroup = "management";
    }

    return {
      id: person.id,
      firstName: person.firstName,
      lastName: person.lastName,
      email: person.email,
      phone: person.phone,
      sportName: person.sport?.name ?? null,
      sportId: person.sport?.id ?? null,
      role,
      roleGroup,
      isActive: person.isActive,
    };
  });
}

