"use server";

import { prisma } from "@/lib/prisma";
import { getRequiredSession } from "@/lib/session";
import { requirePermission } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

export async function deleteUserAction({ id }: { id: number }) {
  try {
    const session = await getRequiredSession();
    requirePermission(session, "users:manage");

    await prisma.$transaction(async (tx) => {
      await tx.personnel.update({
        where: { id },
        data: { isActive: false },
      });

      await tx.auditLog.create({
        data: {
          actorPersonnelId: session.user.personnelId,
          entityType: "personnel",
          entityId: id,
          action: "deactivate",
        }
      });
    });

    revalidatePath("/admin/users");
    revalidatePath("/contacts");
    return { success: true };
  } catch (e: any) {
    console.error(e);
    return { error: e.message || "Failed to deactivate user" };
  }
}

export async function activateUserAction({ id }: { id: number }) {
  try {
    const session = await getRequiredSession();
    requirePermission(session, "users:manage");

    await prisma.$transaction(async (tx) => {
      await tx.personnel.update({
        where: { id },
        data: { isActive: true },
      });

      await tx.auditLog.create({
        data: {
          actorPersonnelId: session.user.personnelId,
          entityType: "personnel",
          entityId: id,
          action: "activate",
        }
      });
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (e: any) {
    console.error(e);
    return { error: e.message || "Failed to activate user" };
  }
}

