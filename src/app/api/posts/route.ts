import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, ok } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const search = searchParams.get("search") ?? "";
    const sportIdParam = searchParams.get("sportId");
    const pageParam = Number(searchParams.get("page") ?? "1");
    const limitParam = Number(searchParams.get("limit") ?? "10");

    const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;
    const limit = Number.isInteger(limitParam) && limitParam > 0 ? Math.min(50, limitParam) : 10;
    const sportId = Number(sportIdParam);
    const hasValidSportId = Number.isInteger(sportId) && sportId > 0;

    const where = {
      isPublished: true,
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" as const } },
          { excerpt: { contains: search, mode: "insensitive" as const } },
        ],
      }),
      ...(hasValidSportId && { sportId }),
    };

    const [total, posts] = await prisma.$transaction([
      prisma.post.count({ where }),
      prisma.post.findMany({
        where,
        select: {
          id: true,
          title: true,
          excerpt: true,
          imageUrl: true,
          publishedAt: true,
          createdAt: true,
          sport: { select: { id: true, name: true } },
          author: { select: { id: true, firstName: true, lastName: true } },
          links: { select: { url: true, alias: true } },
        },
        orderBy: { publishedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return ok({ data: posts, total, page, limit });
  } catch (e) {
    return apiError(e);
  }
}
