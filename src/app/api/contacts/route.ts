import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, ok } from "@/lib/api";
import { NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const search = searchParams.get("search") ?? "";
    const sportIdParam = searchParams.get("sportId");
    const sportId = Number(sportIdParam);
    const hasSportId = sportIdParam !== null;

    if (hasSportId && (!Number.isInteger(sportId) || sportId <= 0)) {
      return NextResponse.json({ error: "Invalid sportId" }, { status: 400 });
    }

    const personnel = await prisma.personnel.findMany({
      where: {
        isActive: true,
        ...(hasSportId && { sportId }),
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
