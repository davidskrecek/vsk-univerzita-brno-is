import "server-only";
import { prisma } from "@/lib/prisma";

import { unstable_cache } from "next/cache";

export const getSports = unstable_cache(
  async () => {
    return prisma.sport.findMany({
      select: {
        id: true,
        name: true,
        isCompetitive: true,
        description: true,
      },
      orderBy: { name: "asc" },
    });
  },
  ["sports"],
  { tags: ["sports"], revalidate: 3600 } // Cache for 1 hour
);

export type Sport = Awaited<ReturnType<typeof getSports>>[number];

