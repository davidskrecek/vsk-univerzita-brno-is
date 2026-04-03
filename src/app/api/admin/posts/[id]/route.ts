import { z } from "zod";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, ok } from "@/lib/api";
import { getRequiredSession } from "@/lib/session";
import { requireRole, requireSportScope } from "@/lib/rbac";
import { NextResponse } from "next/server";

const schema = z.object({
  title: z.string().min(1).max(255).optional(),
  excerpt: z.string().optional(),
  content: z.string().min(1).optional(),
  imageUrl: z.string().url().optional().nullable(),
  isPublished: z.boolean().optional(),
  publishedAt: z.string().datetime().optional().nullable(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getRequiredSession();
    requireRole(session, "superadmin", "sport_manager");

    const { id } = await params;
    const existing = await prisma.post.findUnique({ where: { id: parseInt(id) } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    requireSportScope(session, existing.sportId);

    const body = schema.parse(await req.json());
    const updated = await prisma.post.update({
      where: { id: parseInt(id) },
      data: {
        ...body,
        publishedAt: body.publishedAt ? new Date(body.publishedAt) : undefined,
      },
    });

    return ok(updated);
  } catch (e) {
    return apiError(e);
  }
}
