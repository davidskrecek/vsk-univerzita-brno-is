import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, ok } from "@/lib/api";
import { getRequiredSession } from "@/lib/session";
import { requireRole } from "@/lib/rbac";

const createSchema = z.object({
  partnerName: z.string().min(1).max(255),
  email: z.string().email(),
  details: z.string().min(1),
  requesterPersonnelId: z.number().int().positive(),
});

export async function POST(req: NextRequest) {
  try {
    const body = createSchema.parse(await req.json());

    const requester = await prisma.personnel.findUnique({
      where: { id: body.requesterPersonnelId },
      select: { id: true, isActive: true },
    });

    if (!requester || !requester.isActive) {
      return NextResponse.json({ error: "Invalid requesterPersonnelId" }, { status: 400 });
    }

    const order = await prisma.partnerOrder.create({ data: body });
    return ok(order, 201);
  } catch (e) {
    return apiError(e);
  }
}

export async function GET() {
  try {
    const session = await getRequiredSession();
    requireRole(session, "superadmin");

    const orders = await prisma.partnerOrder.findMany({
      include: {
        requester: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return ok(orders);
  } catch (e) {
    return apiError(e);
  }
}
