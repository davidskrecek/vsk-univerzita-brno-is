"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getRequiredSession, AuthError } from "@/lib/session";
import { requireRole } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

export type SportActionState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  data?: { id: number };
};

const createSportSchema = z.object({
  name: z.string().min(1).max(100),
  isCompetitive: z.preprocess((v) => v === "true" || v === true, z.boolean()).optional(),
  description: z.string().optional(),
  headOfficialPersonnelId: z.coerce.number().int().positive().optional(),
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

export async function createSport(
  _prevState: SportActionState,
  formData: FormData
): Promise<SportActionState> {
  try {
    const session = await getRequiredSession();
    requireRole(session, "superadmin");

    const rawValues = parseFormData(formData);
    const parsed = createSportSchema.safeParse(rawValues);

    if (!parsed.success) {
      return {
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const body = parsed.data;

    const sport = await prisma.sport.create({
      data: {
        name: body.name,
        isCompetitive: body.isCompetitive,
        description: body.description,
        headOfficialPersonnelId: body.headOfficialPersonnelId,
      },
    });

    revalidatePath("/admin/sports");
    revalidatePath("/sports");

    return { success: true, data: { id: sport.id } };
  } catch (e) {
    if (e instanceof z.ZodError) {
      return {
        error: "Validation failed",
        fieldErrors: e.flatten().fieldErrors as Record<string, string[]>,
      };
    }
    if (e instanceof AuthError) {
      return { error: e.message };
    }
    console.error(e);
    return { error: "Failed to create sport" };
  }
}
