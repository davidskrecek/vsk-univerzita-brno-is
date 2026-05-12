"use server";

import { prisma } from "@/lib/prisma";
import { getRequiredSession } from "@/lib/session";
import { requirePermission } from "@/lib/rbac";
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
  
  await emailQueue.add("send-invitation", {
    type: "invitation",
    email,
    link: invitationLink,
  });
}

export async function resendInvitationAction({ personnelId, email }: { personnelId: number, email: string }) {
  try {
    const session = await getRequiredSession();
    requirePermission(session, "users:manage");

    await createAndSendInvitation(personnelId, email, session.user.personnelId);
    return { success: true };
  } catch (e: any) {
    console.error("[AUTH] resendInvitation error:", e);
    return { error: e.message || "Nepodařilo se odeslat pozvánku." };
  }
}

