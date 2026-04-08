import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, ok } from "@/lib/api";
import { NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const sportIdParam = searchParams.get("sportId");
    const sportId = Number(sportIdParam);
    const hasSportId = sportIdParam !== null;

    if (hasSportId && (!Number.isInteger(sportId) || sportId <= 0)) {
      return NextResponse.json({ error: "Invalid sportId" }, { status: 400 });
    }

    const startTime: { gte?: Date; lte?: Date } = {};
    if (from) {
      const fromDate = new Date(from);
      if (Number.isNaN(fromDate.getTime())) {
        return NextResponse.json({ error: "Invalid from" }, { status: 400 });
      }
      startTime.gte = fromDate;
    }
    if (to) {
      const toDate = new Date(to);
      if (Number.isNaN(toDate.getTime())) {
        return NextResponse.json({ error: "Invalid to" }, { status: 400 });
      }
      startTime.lte = toDate;
    }

    const where = {
      isPublic: true,
      isCancelled: false,
      ...(Object.keys(startTime).length > 0 && { startTime }),
      ...(hasSportId && { sportId }),
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
        links: { select: { url: true, alias: true } },
      },
      orderBy: { startTime: "asc" },
    });

    return ok(events);
  } catch (e) {
    return apiError(e);
  }
}
