"use server";

import { prisma } from "@/lib/prisma";

export interface PostDetailData {
  id: number;
  title: string;
  content: string;
  imageUrl: string | null;
  publishedAt: string | null;
  createdAt: string;
  sport: { id: number; name: string };
  author: { id: number; firstName: string; lastName: string } | null;
  media: Array<{
    id: number;
    mediaUrl: string;
    mediaType: string;
    sortOrder: number;
  }>;
  links: Array<{ url: string; alias: string | null }>;
}

export async function getPostDetail(id: number): Promise<PostDetailData | null> {
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  const post = await prisma.post.findFirst({
    where: { id, isPublished: true },
    include: {
      sport: { select: { id: true, name: true } },
      author: { select: { id: true, firstName: true, lastName: true } },
      media: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!post) {
    return null;
  }

  return {
    ...post,
    publishedAt: post.publishedAt?.toISOString() ?? null,
    createdAt: post.createdAt.toISOString(),
  };
}

export type PostDetailResult = PostDetailData | null;
