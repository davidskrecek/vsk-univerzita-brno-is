import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, ok } from "@/lib/api";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const parsedId = Number(id);
    if (!Number.isInteger(parsedId) || parsedId <= 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const post = await prisma.post.findFirst({
      where: { id: parsedId, isPublished: true },
      include: {
        sport: { select: { id: true, name: true } },
        author: { select: { id: true, firstName: true, lastName: true } },
        media: { orderBy: { sortOrder: "asc" } },
        links: { select: { url: true, alias: true } },
      },
    });
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return ok(post);
  } catch (e) {
    return apiError(e);
  }
}
