"use server";

import { prisma } from "@/lib/prisma";
import { getRequiredSession } from "@/lib/session";
import { requirePermission } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import { UserFormSchema, UserActionState } from "@/actions/admin/users/schemas";
import crypto from "crypto";
import { emailQueue } from "@/lib/queues/email-queue";

async function createAndSendInvitation(personnelId: number, email: string, createdByPersonnelId: number) {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);

  await prisma.accountInvitation.create({
    data: {
      personnelId,
      tokenHash,
      expiresAt,
      createdByPersonnelId,
    },
  });

  const invitationLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
  
  // Add to background queue
  await emailQueue.add("send-invitation", {
    type: "invitation",
    email,
    link: invitationLink,
  }, {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    }
  });
}

export async function updateUserAction(_prevState: any, formData: FormData): Promise<UserActionState> {
  try {
    const session = await getRequiredSession();
    requirePermission(session, "users:manage");

    const rawData = Object.fromEntries(formData.entries());
    const processedData = { ...rawData };
    if (rawData.managedSportIds) {
        processedData.managedSportIds = JSON.parse(rawData.managedSportIds as string);
    }

    const parsed = UserFormSchema.safeParse(processedData);
    if (!parsed.success) {
      return {
        error: "Validace selhala.",
        fieldErrors: parsed.error.flatten().fieldErrors as any,
      };
    }

    const body = parsed.data;
    const id = Number(body.personnelId);

    const existingUser = await prisma.personnel.findUnique({
      where: { id },
      include: { editor: true }
    });

    await prisma.$transaction(async (tx) => {
      await tx.personnel.update({
        where: { id },
        data: {
          firstName: body.firstName,
          lastName: body.lastName,
          email: body.email,
          phone: body.phone,
          sportId: body.sportId,
          isActive: body.isActive,
        },
      });

      if (body.editorRoleId !== undefined) {
        if (body.editorRoleId) {
          await tx.editor.upsert({
            where: { personnelId: id },
            create: {
              personnelId: id,
              passwordHash: "PENDING",
              editorRoleId: body.editorRoleId,
              managedSports: {
                create: body.managedSportIds.map((sportId) => ({ sportId })),
              },
            },
            update: {
              editorRoleId: body.editorRoleId,
              managedSports: {
                deleteMany: {},
                create: body.managedSportIds.map((sportId) => ({ sportId })),
              },
            },
          });
        } else {
          await tx.editor.deleteMany({ where: { personnelId: id } });
        }
      }

      if (body.isTrainer !== undefined) {
        if (body.isTrainer) {
          await tx.trainer.upsert({
            where: { personnelId: id },
            create: { personnelId: id, category: body.trainerCategory },
            update: { category: body.trainerCategory },
          });
        } else {
          await tx.trainer.deleteMany({ where: { personnelId: id } });
        }
      }

      if (body.isOfficial !== undefined) {
        if (body.isOfficial && body.officialPosition) {
          await tx.official.upsert({
            where: { personnelId: id },
            create: { personnelId: id, position: body.officialPosition },
            update: { position: body.officialPosition },
          });
        } else {
          await tx.official.deleteMany({ where: { personnelId: id } });
        }
      }

      // Create Audit Log
      await tx.auditLog.create({
        data: {
          actorPersonnelId: session.user.personnelId,
          entityType: "personnel",
          entityId: id,
          action: "update",
          payload: body as any,
        }
      });
    });

    revalidatePath("/admin/users");

    if (existingUser && !existingUser.editor && body.editorRoleId) {
      try {
        await createAndSendInvitation(id, body.email, session.user.personnelId);
      } catch (emailError) {
        console.error("[AUTH] Failed to send invitation email during update:", emailError);
      }
    }

    return { success: true };
  } catch (e: any) {
    console.error("[AUTH] updateUser error:", e);
    if (e.code === "P2002") return { error: "Uživatel s tímto e-mailem již v systému existuje." };
    return { error: "Nepodařilo se aktualizovat uživatele." };
  }
}

