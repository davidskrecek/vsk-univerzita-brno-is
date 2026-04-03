import { z } from "zod";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, ok } from "@/lib/api";
import { getRequiredSession } from "@/lib/session";
import { requireRole, requireSportScope } from "@/lib/rbac";

const schema = z.object({
  sportId: z.number().int().positive(),
  title: z.string().min(1).max(255),
  excerpt: z.string().optional(),
  content: z.string().min(1),
  imageUrl: z.string().url().optional(),
  isPublished: z.boolean().optional(),
  publishedAt: z.string().datetime().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getRequiredSession();
    requireRole(session, "superadmin", "sport_manager");

    const body = schema.parse(await req.json());
    requireSportScope(session, body.sportId);

    const post = await prisma.post.create({
      data: {
        ...body,
        publishedAt: body.publishedAt ? new Date(body.publishedAt) : body.isPublished ? new Date() : null,
        authorPersonnelId: session.user.personnelId,
      },
    });

    return ok(post, 201);
  } catch (e) {
    return apiError(e);
  }
}
