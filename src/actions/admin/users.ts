"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getRequiredSession, AuthError } from "@/lib/session";
import { requireRole } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import {sendPasswordResetEmail} from "@/lib/mailer";
import {User} from "@/lib/queries/users";

export type UserActionState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  data?: { personnelId: number; invitationToken: string };
};

export type UserStatsResult = {
  total: number;
  byRole: { role: string; count: number }[];
};

const createUserSchema = z.object({
  personnelId: z.string().optional(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().max(30).optional(),
  sportId: z.coerce.number().int().positive().optional(),
  editorRoleId: z.coerce.number().int().positive(),
  managedSportIds: z
    .preprocess(
      (v) => (typeof v === "string" ? JSON.parse(v) : v),
      z.array(z.coerce.number().int().positive())
    )
    .optional()
    .default([]),
  isTrainer: z.preprocess((v) => v === "true" || v === true, z.boolean()).optional(),
  trainerCategory: z.string().max(100).optional(),
  isOfficial: z.preprocess((v) => v === "true" || v === true, z.boolean()).optional(),
  officialPosition: z.string().max(100).optional(),
  isActive: z.preprocess((v) => v === "true" || v === true, z.boolean()).optional(),
});

function parseFormData(formData: FormData): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  formData.forEach((value, key) => {
    if (value !== "") {
      result[key] = value;
    }
  });
  return result;
}

export async function createUser(
  _prevState: UserActionState,
  formData: FormData
): Promise<UserActionState> {
  try {
    const session = await getRequiredSession();
    requireRole(session, "superadmin");

    const rawValues = parseFormData(formData);
    const parsed = createUserSchema.safeParse(rawValues);

    if (!parsed.success) {
      return {
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const body = parsed.data;
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
          personnel: {
            connect: {
              id: p.id,
            }
          },
          passwordHash: placeholderHash,
          editorRole: {
            connect: {
              id: body.editorRoleId,
            }
          },
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
    });

    revalidatePath("/admin/users");

    return { success: true, data: { personnelId: personnel.id, invitationToken: token } };
  } catch (e) {
    console.error(e);

    if (e instanceof z.ZodError) {
      return {
        error: "Validation failed",
        fieldErrors: e.flatten().fieldErrors as Record<string, string[]>,
      };
    }
    if (e instanceof AuthError) {
      return { error: e.message };
    }
    return { error: "Failed to create user" };
  }
}

export async function updateUser(_prevState: UserActionState, formData: FormData): Promise<UserActionState> {
  try {
    const session = await getRequiredSession();
    requireRole(session, "superadmin");

    const rawValues = parseFormData(formData);

    const parsed = createUserSchema.safeParse(rawValues);

    if (!parsed.success) {
      return {
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const body = parsed.data;

    await prisma.$transaction(
        async (tx) => {
          await tx.personnel.update({
            where: {
              id: Number(body.personnelId),
            },
            data: {
              firstName: body.firstName,
              lastName: body.lastName,
              email: body.email,
              phone: body.phone,
              sportId: body.sportId,
              isActive: body.isActive,
            },
          });

          await tx.editor.update({
            where: {
              personnelId: Number(body.personnelId),
            },
            data: {
              editorRole: {
                connect: {
                  id: body.editorRoleId,
                },
              },

              managedSports: {
                deleteMany: {},
                create: body.managedSportIds.map((sportId) => ({sportId})),
              },
            },
          });

          if (body.isTrainer) {
            await tx.trainer.upsert({
              where: {
                personnelId: Number(body.personnelId),
              },

              create: {
                personnelId: Number(body.personnelId),
                category: body.trainerCategory,
              },

              update: {
                category: body.trainerCategory,
              },
            });
          } else {
            await tx.trainer.deleteMany({
                  where: {
                    personnelId: Number(body.personnelId),
                  },
                }
            );
          }

          if (body.isOfficial && body.officialPosition) {
            await tx.official.upsert({
              where: {
                personnelId: Number(body.personnelId),
              },

              create: {
                personnelId: Number(body.personnelId),
                position: body.officialPosition,
              },

              update: {
                position: body.officialPosition,
              },
            });
          } else {
            await tx.official.deleteMany({
                  where: {
                    personnelId: Number(body.personnelId),
                  },
                }
            );
          }
        }
    );

    revalidatePath("/admin/users");

    return {
      success: true,
    };
  } catch (e) {
    console.log(e);

    if (e instanceof z.ZodError) {
      return {
        error: "Failed to validate user",
        fieldErrors: e.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    if (e instanceof AuthError) {
      return { error: e.message };
    }

    return { error: e};
  }
}

export async function getUserStats(): Promise<UserStatsResult> {
  const session = await getRequiredSession();
  requireRole(session, "superadmin");

  const [total, byRole] = await prisma.$transaction([
    prisma.editor.count(),
    prisma.editorRole.findMany({
      select: {
        name: true,
        _count: { select: { editors: true } },
      },
    }),
  ]);

  return {
    total,
    byRole: byRole.map((r) => ({ role: r.name, count: r._count.editors })),
  };
}

export async function sendPasswordEmail(user: User): Promise<UserActionState> {
  const session = await getRequiredSession();
  requireRole(session, "superadmin");

  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  try {
    await prisma.accountInvitation.create({
      data: {
        personnelId: Number(user.id),
        tokenHash,
        expiresAt,
        createdByPersonnelId: session.user.personnelId,
      },
    });

    await sendPasswordResetEmail(user.email, `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`);

    return {success: true}
  } catch (e) {
    return  {
      error: "Failed to send password reset email"
    }
  }
}
