"use server";

import { prisma } from "@/lib/prisma";

export async function getAvailableSports() {
  const sports = await prisma.sport.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  return sports;
}

