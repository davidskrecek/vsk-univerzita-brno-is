"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserRole } from "@/lib/constants/roles";

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
  canEdit: boolean;
}

export async function getPostDetail(id: number): Promise<PostDetailData | null> {
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  const [post, session] = await Promise.all([
    prisma.post.findFirst({
      where: { id, isPublished: true },
      include: {
        sport: { select: { id: true, name: true } },
        author: { select: { id: true, firstName: true, lastName: true } },
        media: { orderBy: { sortOrder: "asc" } },
        links: { select: { url: true, alias: true } },
      },
    }),
    getServerSession(authOptions)
  ]);

  if (!post) {
    return null;
  }

  // Server-side authorization check
  let canEdit = false;
  if (session?.user) {
    if (session.user.role === UserRole.SUPERADMIN) {
      canEdit = true;
    } else if (post.authorPersonnelId === Number(session.user.personnelId)) {
      canEdit = true;
    } else if (
      (session.user.role === UserRole.SPORT_MANAGER || session.user.role === UserRole.EDITOR) && 
      session.user.managedSportIds?.includes(post.sportId)
    ) {
      canEdit = true;
    }
  }

  return {
    ...post,
    publishedAt: post.publishedAt?.toISOString() ?? null,
    createdAt: post.createdAt.toISOString(),
    canEdit,
  };
}

export type PostDetailResult = PostDetailData | null;


