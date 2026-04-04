import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, ok } from "@/lib/api";
import { getRequiredSession } from "@/lib/session";
import { requireRole, requireSportScope } from "@/lib/rbac";

const schema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional().nullable(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional().nullable(),
  location: z.string().max(255).optional().nullable(),
  eventType: z.string().max(50).optional().nullable(),
  ticketUrl: z.string().url().optional().nullable(),
  mapUrl: z.string().url().optional().nullable(),
  isPublic: z.boolean().optional(),
  isCancelled: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getRequiredSession();
    requireRole(session, "superadmin", "sport_manager");

    const { id } = await params;
    const eventId = Number(id);
    if (!Number.isInteger(eventId) || eventId <= 0) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const existing = await prisma.event.findUnique({ where: { id: eventId } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    requireSportScope(session, existing.sportId);

    const body = schema.parse(await req.json());
    const updated = await prisma.event.update({
      where: { id: eventId },
      data: {
        ...body,
        startTime: body.startTime ? new Date(body.startTime) : undefined,
        endTime: body.endTime ? new Date(body.endTime) : body.endTime,
      },
    });

    return ok(updated);
  } catch (e) {
    return apiError(e);
  }
}
