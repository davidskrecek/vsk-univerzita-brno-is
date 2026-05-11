"use server";

import { prisma } from "@/lib/prisma";
import { getRequiredSession, AuthError } from "@/lib/session";
import { requirePermission } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import { CreateEventSchema, EventActionState } from "./schemas";
import { UserRole } from "@/lib/constants/roles";

export async function createEventAction(
  _prevState: EventActionState,
  formData: FormData
): Promise<EventActionState> {
  try {
    const session = await getRequiredSession();
    requirePermission(session, "events:write");

    const rawData = Object.fromEntries(formData.entries());
    const parsed = CreateEventSchema.safeParse(rawData);

    if (!parsed.success) {
      return {
        error: "Validace selhala",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const body = parsed.data;
    
    // Check sport scope
    if (session.user.role !== UserRole.SUPERADMIN && !session.user.managedSportIds.includes(body.sportId)) {
      throw new AuthError(403, "Nemáte oprávnění pro tento sport.");
    }

    const endTime = body.endTime === "" || body.endTime === null ? null : new Date(body.endTime!);
    const ticketUrl = body.ticketUrl === "" ? undefined : body.ticketUrl || undefined;
    const mapUrl = body.mapUrl === "" ? undefined : body.mapUrl || undefined;

    const event = await prisma.$transaction(async (tx) => {
      const e = await tx.event.create({
        data: {
          sportId: body.sportId,
          title: body.title,
          description: body.description,
          startTime: new Date(body.startTime),
          endTime,
          location: body.location,
          eventType: body.eventType,
          ticketUrl,
          mapUrl,
          isPublic: body.isPublic,
          links: body.links ? { create: body.links } : undefined,
          authorPersonnelId: session.user.personnelId,
        },
      });

      await tx.auditLog.create({
        data: {
          actorPersonnelId: session.user.personnelId,
          entityType: "event",
          entityId: e.id,
          action: "create",
          payload: body as any,
        }
      });

      return e;
    });

    revalidatePath("/admin/events");
    revalidatePath(`/events`);

    return { success: true, data: { id: event.id } };
  } catch (e: any) {
    console.error("[EVENTS] createEvent error:", e);
    if (e instanceof AuthError) return { error: e.message };
    return { error: "Nepodařilo se vytvořit událost." };
  }
}

