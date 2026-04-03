import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, ok } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const sportId = searchParams.get("sportId");

    const where = {
      isPublic: true,
      isCancelled: false,
      ...(from && { startTime: { gte: new Date(from) } }),
      ...(to && { startTime: { lte: new Date(to) } }),
      ...(sportId && { sportId: parseInt(sportId) }),
    };

    const events = await prisma.event.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        startTime: true,
        endTime: true,
        location: true,
        eventType: true,
        isPublic: true,
        isCancelled: true,
        sport: { select: { id: true, name: true } },
      },
      orderBy: { startTime: "asc" },
    });

    return ok(events);
  } catch (e) {
    return apiError(e);
  }
}
