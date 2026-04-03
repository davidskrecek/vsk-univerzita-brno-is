import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, ok } from "@/lib/api";
import { NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const post = await prisma.post.findUnique({
      where: { id: parseInt(id), isPublished: true },
      include: {
        sport: { select: { id: true, name: true } },
        author: { select: { id: true, firstName: true, lastName: true } },
        media: { orderBy: { sortOrder: "asc" } },
      },
    });
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return ok(post);
  } catch (e) {
    return apiError(e);
  }
}
