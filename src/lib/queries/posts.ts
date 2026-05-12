import "server-only";
import { prisma } from "@/lib/prisma";
import type { PostListItem } from "@/components/features/posts/postUtils";

export async function getPublishedPosts(sportName?: string, page = 1, limit = 50): Promise<{ posts: PostListItem[]; total: number }> {
  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
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
      skip: skip,
    }),
    prisma.post.count({
      where: { 
        isPublished: true,
        sport: sportName ? { name: sportName } : undefined
      }
    })
  ]);

  return {
    posts: posts.map((post) => ({
      ...post,
      publishedAt: post.publishedAt?.toISOString() ?? null,
      createdAt: post.createdAt.toISOString(),
    })),
    total
  };
}

