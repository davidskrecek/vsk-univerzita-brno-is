import { z } from "zod";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { apiError, ok } from "@/lib/api";

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const tokenHash = crypto.createHash("sha256").update(body.token).digest("hex");

    const invitation = await prisma.accountInvitation.findUnique({
      where: { tokenHash },
    });

    if (!invitation || invitation.usedAt || invitation.expiresAt < new Date()) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    const hash = await bcrypt.hash(body.password, 12);

    await prisma.$transaction([
      prisma.editor.update({
        where: { personnelId: invitation.personnelId },
        data: { passwordHash: hash },
      }),
      prisma.accountInvitation.update({
        where: { id: invitation.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return ok({ success: true });
  } catch (e) {
    return apiError(e);
  }
}
