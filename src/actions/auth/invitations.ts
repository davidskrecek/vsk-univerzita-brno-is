"use server";

import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function getUserByInvitationToken(token: string) {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const invitation = await prisma.accountInvitation.findFirst({
    where: {
      tokenHash,
      usedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
    include: {
      personnel: {
        include: {
          editor: true,
        },
      },
    },
  });

  if (!invitation) return null;

  return {
    id: invitation.personnel.id,
    email: invitation.personnel.email,
    hasPassword: !!invitation.personnel.editor?.passwordHash && invitation.personnel.editor.passwordHash !== "PENDING",
    isFirstTime: invitation.personnel.editor?.passwordHash === "PENDING",
  };
}

