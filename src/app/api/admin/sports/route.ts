import { z } from "zod";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, ok } from "@/lib/api";
import { getRequiredSession } from "@/lib/session";
import { requireRole } from "@/lib/rbac";

const schema = z.object({
  name: z.string().min(1).max(100),
  isCompetitive: z.boolean().optional(),
  description: z.string().optional(),
  headOfficialPersonnelId: z.number().int().positive().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getRequiredSession();
    requireRole(session, "superadmin");

    const body = schema.parse(await req.json());
    const sport = await prisma.sport.create({ data: body });
    return ok(sport, 201);
  } catch (e) {
    return apiError(e);
  }
}
