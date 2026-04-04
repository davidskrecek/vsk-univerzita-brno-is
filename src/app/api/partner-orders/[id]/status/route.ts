import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
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
    const orderId = Number(id);
    if (!Number.isInteger(orderId) || orderId <= 0) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const { status } = statusSchema.parse(await req.json());

    const existing = await prisma.partnerOrder.findUnique({ where: { id: orderId }, select: { id: true } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const order = await prisma.partnerOrder.update({
      where: { id: orderId },
      data: { status },
    });

    return ok(order);
  } catch (e) {
    return apiError(e);
  }
}
