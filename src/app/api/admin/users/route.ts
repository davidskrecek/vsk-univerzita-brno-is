import { z } from "zod";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, ok } from "@/lib/api";
import { getRequiredSession } from "@/lib/session";
import { requireRole } from "@/lib/rbac";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const schema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().max(30).optional(),
  sportId: z.number().int().positive().optional(),
  editorRoleId: z.number().int().positive(),
  managedSportIds: z.array(z.number().int().positive()).optional().default([]),
  isTrainer: z.boolean().optional(),
  trainerCategory: z.string().max(100).optional(),
  isOfficial: z.boolean().optional(),
  officialPosition: z.string().max(100).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getRequiredSession();
    requireRole(session, "superadmin");

    const body = schema.parse(await req.json());

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const placeholderHash = await bcrypt.hash(crypto.randomBytes(16).toString("hex"), 12);

    const personnel = await prisma.$transaction(async (tx) => {
      const p = await tx.personnel.create({
        data: {
          firstName: body.firstName,
          lastName: body.lastName,
          email: body.email,
          phone: body.phone,
          sportId: body.sportId,
        },
      });

      await tx.editor.create({
        data: {
          personnelId: p.id,
          passwordHash: placeholderHash,
          editorRoleId: body.editorRoleId,
          managedSports: {
            create: body.managedSportIds.map((sportId) => ({ sportId })),
          },
        },
      });

      if (body.isTrainer) {
        await tx.trainer.create({ data: { personnelId: p.id, category: body.trainerCategory } });
      }

      if (body.isOfficial && body.officialPosition) {
        await tx.official.create({ data: { personnelId: p.id, position: body.officialPosition } });
      }

      await tx.accountInvitation.create({
        data: {
          personnelId: p.id,
          tokenHash,
          expiresAt,
          createdByPersonnelId: session.user.personnelId,
        },
      });

      return p;
    });

    return ok({ personnel, invitationToken: token }, 201);
  } catch (e) {
    return apiError(e);
  }
}
