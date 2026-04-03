import { z } from "zod";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, ok } from "@/lib/api";
import { getRequiredSession } from "@/lib/session";
import { requireRole, requireSportScope } from "@/lib/rbac";

const schema = z.object({
  sportId: z.number().int().positive(),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().optional(),
  location: z.string().max(255).optional(),
  eventType: z.string().max(50).optional(),
  ticketUrl: z.string().url().optional(),
  mapUrl: z.string().url().optional(),
  isPublic: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getRequiredSession();
    requireRole(session, "superadmin", "sport_manager");

    const body = schema.parse(await req.json());
    requireSportScope(session, body.sportId);

    const event = await prisma.event.create({
      data: {
        ...body,
        startTime: new Date(body.startTime),
        endTime: body.endTime ? new Date(body.endTime) : null,
        authorPersonnelId: session.user.personnelId,
      },
    });

    return ok(event, 201);
  } catch (e) {
    return apiError(e);
  }
}
