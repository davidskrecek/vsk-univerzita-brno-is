import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, ok } from "@/lib/api";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const parsedId = Number(id);
    if (!Number.isInteger(parsedId) || parsedId <= 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const event = await prisma.event.findFirst({
      where: { id: parsedId, isPublic: true },
      include: {
        sport: { select: { id: true, name: true } },
        author: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return ok(event);
  } catch (e) {
    return apiError(e);
  }
}
