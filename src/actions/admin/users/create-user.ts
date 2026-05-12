"use server";

import { prisma } from "@/lib/prisma";
import { getRequiredSession } from "@/lib/session";
import { requirePermission, requireSportScope } from "@/lib/rbac";
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
  }//, {
  //   attempts: 3,
  //   backoff: {
  //     type: "exponential",
  //     delay: 5000,
  //   }
  // }
  );
}

export async function createUserAction(formData: FormData): Promise<UserActionState> {
  try {
    const session = await getRequiredSession();
    requirePermission(session, "users:manage");

    const rawData = Object.fromEntries(formData.entries());
    const processedData = { ...rawData };
    if (rawData.managedSportIds) {
        processedData.managedSportIds = JSON.parse(rawData.managedSportIds as string);
    }
    if (rawData.permissions) {
        processedData.permissions = JSON.parse(rawData.permissions as string);
    }

    const parsed = UserFormSchema.safeParse(processedData);
    if (!parsed.success) {
      return {
        error: "Validace selhala.",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const body = parsed.data;
    if (body.sportId) {
      requireSportScope(session, body.sportId);
    }
    
    if (body.managedSportIds && body.managedSportIds.length > 0) {
      body.managedSportIds.forEach((sportId: number) => requireSportScope(session, sportId));
    }

    const personnel = await prisma.$transaction(async (tx) => {
      const p = await tx.personnel.create({
        data: {
          firstName: body.firstName,
          lastName: body.lastName,
          email: body.email,
          phone: body.phone,
          sportId: body.sportId,
          isActive: body.isActive,
        },
      });

      if (body.editorRoleId) {
        await tx.editor.create({
          data: {
            personnelId: p.id,
            passwordHash: "PENDING",
            editorRoleId: body.editorRoleId,
            permissions: body.permissions || {},
            managedSports: {
              create: body.managedSportIds.map((sportId) => ({ sportId })),
            },
          },
        });
      }

      if (body.isTrainer) {
        await tx.trainer.create({ data: { personnelId: p.id, category: body.trainerCategory } });
      }

      if (body.isOfficial && body.officialPosition) {
        await tx.official.create({ data: { personnelId: p.id, position: body.officialPosition } });
      }

      // Create Audit Log
      await tx.auditLog.create({
        data: {
          actorPersonnelId: session.user.personnelId,
          entityType: "personnel",
          entityId: p.id,
          action: "create",
          payload: JSON.parse(JSON.stringify(body)),
        }
      });

      return p;
    });

    revalidatePath("/admin/users");

    if (body.editorRoleId) {
      try {
        await createAndSendInvitation(personnel.id, body.email, session.user.personnelId);
      } catch (emailError) {
        console.error("[AUTH] Failed to send invitation email:", emailError);
        return { 
          success: true, 
          data: { personnelId: personnel.id },
          error: "Uživatel byl vytvořen, ale nepodařilo se odeslat e-mailovou pozvánku."
        };
      }
    }

    return { success: true, data: { personnelId: personnel.id } };
  } catch (e) {
    console.error("[AUTH] createUser error:", e);
    if ((e as { code?: string }).code === "P2002") return { error: "Uživatel s tímto e-mailem již v systému existuje." };
    return { error: "Nepodařilo se vytvořit uživatele." };
  }
}


