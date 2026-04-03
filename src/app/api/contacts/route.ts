import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, ok } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const search = searchParams.get("search") ?? "";
    const sportId = searchParams.get("sportId");

    const personnel = await prisma.personnel.findMany({
      where: {
        isActive: true,
        ...(sportId && { sportId: parseInt(sportId) }),
        ...(search && {
          OR: [
            { firstName: { contains: search, mode: "insensitive" as const } },
            { lastName: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }),
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
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    });

    return ok(personnel);
  } catch (e) {
    return apiError(e);
  }
}
