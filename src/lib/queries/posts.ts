import "server-only";
import { prisma } from "@/lib/prisma";
import type { PostListItem } from "@/components/Posts/postUtils";

export async function getPublishedPosts(sportName?: string, limit = 50): Promise<PostListItem[]> {
  const posts = await prisma.post.findMany({
    where: { 
      isPublished: true,
      sport: sportName ? { name: sportName } : undefined
    },
    select: {
      id: true,
      title: true,
      excerpt: true,
      imageUrl: true,
      publishedAt: true,
      createdAt: true,
      sport: { select: { id: true, name: true } },
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: limit,
  });

  return posts.map((post) => ({
    ...post,
    publishedAt: post.publishedAt?.toISOString() ?? null,
    createdAt: post.createdAt.toISOString(),
  }));
}

export async function getPostById(id: number) {
  return prisma.post.findFirst({
    where: { id, isPublished: true },
    include: {
      sport: { select: { id: true, name: true } },
      author: { select: { id: true, firstName: true, lastName: true } },
      media: { orderBy: { sortOrder: "asc" } },
      links: { select: { url: true, alias: true } },
    },
  });
}

export type PostDetail = Awaited<ReturnType<typeof getPostById>>;
