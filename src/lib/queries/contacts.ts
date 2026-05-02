import "server-only";
import { prisma } from "@/lib/prisma";

export async function getActiveContacts() {
  return prisma.personnel.findMany({
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
}

export type Contact = Awaited<ReturnType<typeof getActiveContacts>>[number];
