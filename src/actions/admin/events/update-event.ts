"use server";

import { prisma } from "@/lib/prisma";
import { getRequiredSession, AuthError } from "@/lib/session";
import { requirePermission } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import { UpdateEventSchema, EventActionState } from "./schemas";
import { UserRole, isEditorialRole } from "@/lib/constants/roles";

export async function updateEventAction(
  _prevState: EventActionState,
  formData: FormData
): Promise<EventActionState> {
  try {
    const session = await getRequiredSession();
    requirePermission(session, "events:write");

    const rawData = Object.fromEntries(formData.entries());
    const parsed = UpdateEventSchema.safeParse(rawData);

    if (!parsed.success) {
      return {
        error: "Validace selhala",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const body = parsed.data;
    const eventId = body.id;

    const existing = await prisma.event.findUnique({ where: { id: eventId } });
    if (!existing) return { error: "Událost nebyla nalezena." };

    // AUTHORIZATION CHECK
    let canEdit = false;
    if (session.user.role === UserRole.SUPERADMIN) {
      canEdit = true;
    } else if (existing.authorPersonnelId === Number(session.user.personnelId)) {
      canEdit = true;
    } else if (isEditorialRole(session.user.role) && session.user.managedSportIds.includes(existing.sportId)) {
      canEdit = true;
    }

    if (!canEdit) throw new AuthError(403, "Nemáte oprávnění k úpravě této události.");

    const startTime = body.startTime ? new Date(body.startTime) : undefined;
    const endTime =
      body.endTime === "" || body.endTime === null
        ? null
        : body.endTime
          ? new Date(body.endTime)
          : undefined;

    const description = body.description === "" ? null : body.description;
    const location = body.location === "" ? null : body.location;
    const eventType = body.eventType === "" ? null : body.eventType;
    const ticketUrl = body.ticketUrl === "" ? null : body.ticketUrl;
    const mapUrl = body.mapUrl === "" ? null : body.mapUrl;

    const updated = await prisma.$transaction(async (tx) => {
      const u = await tx.event.update({
        where: { id: eventId },
        data: {
          title: body.title,
          description,
          startTime,
          endTime,
          location,
          eventType,
          ticketUrl,
          mapUrl,
          isPublic: body.isPublic,
          isCancelled: body.isCancelled,
          links: body.links ? { deleteMany: {}, create: body.links } : undefined,
        },
      });

      await tx.auditLog.create({
        data: {
          actorPersonnelId: session.user.personnelId,
          entityType: "event",
          entityId: eventId,
          action: "update",
          payload: body as any,
        }
      });

      return u;
    });

    revalidatePath("/admin/events");
    revalidatePath(`/events/${eventId}`);
    revalidatePath(`/events`);

    return { success: true, data: { id: updated.id } };
  } catch (e: any) {
    console.error("[EVENTS] updateEvent error:", e);
    if (e instanceof AuthError) return { error: e.message };
    return { error: "Nepodařilo se aktualizovat událost." };
  }
}

