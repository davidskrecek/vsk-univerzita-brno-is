import "server-only";
import { prisma } from "@/lib/prisma";

export async function getSports() {
  return prisma.sport.findMany({
    select: {
      id: true,
      name: true,
      isCompetitive: true,
      description: true,
    },
    orderBy: { name: "asc" },
  });
}

export type Sport = Awaited<ReturnType<typeof getSports>>[number];
