"use server";

import { prisma } from "@/lib/prisma";
import { getRequiredSession, AuthError } from "@/lib/session";
import { requirePermission, requireSportScope } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import { UserRole, isEditorialRole } from "@/lib/constants/roles";

export async function deleteEventAction(eventId: number): Promise<{ success?: boolean; error?: string }> {
  try {
    const session = await getRequiredSession();
    requirePermission(session, "events:full");

    if (!Number.isInteger(eventId) || eventId <= 0) {
      return { error: "Neplatné ID události" };
    }

    const existing = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, sportId: true, authorPersonnelId: true },
    });

    if (!existing) return { error: "Událost nebyla nalezena." };

    // AUTHORIZATION CHECK
    requireSportScope(session, existing.sportId);

    await prisma.$transaction(async (tx) => {
      await tx.event.delete({ where: { id: eventId } });

      await tx.auditLog.create({
        data: {
          actorPersonnelId: session.user.personnelId,
          entityType: "event",
          entityId: eventId,
          action: "delete",
        }
      });
    });

    revalidatePath("/admin/events");
    revalidatePath(`/events`);

    return { success: true };
  } catch (e: any) {
    console.error("[EVENTS] deleteEvent error:", e);
    if (e instanceof AuthError) return { error: e.message };
    return { error: "Nepodařilo se smazat událost." };
  }
}

