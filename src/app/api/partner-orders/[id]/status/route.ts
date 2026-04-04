import { z } from "zod";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, ok } from "@/lib/api";
import { getRequiredSession } from "@/lib/session";
import { requireRole } from "@/lib/rbac";

const statusSchema = z.object({
  status: z.enum(["submitted", "processing", "completed", "rejected"]),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getRequiredSession();
    requireRole(session, "superadmin");

    const { id } = await params;
    const { status } = statusSchema.parse(await req.json());

    const order = await prisma.partnerOrder.update({
      where: { id: parseInt(id) },
      data: { status },
    });

    return ok(order);
  } catch (e) {
    return apiError(e);
  }
}
