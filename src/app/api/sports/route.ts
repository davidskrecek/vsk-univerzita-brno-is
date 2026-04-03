import { prisma } from "@/lib/prisma";
import { apiError, ok } from "@/lib/api";

export async function GET() {
  try {
    const sports = await prisma.sport.findMany({
      select: {
        id: true,
        name: true,
        isCompetitive: true,
        description: true,
      },
      orderBy: { name: "asc" },
    });
    return ok(sports);
  } catch (e) {
    return apiError(e);
  }
}
