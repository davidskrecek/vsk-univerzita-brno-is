"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserRole, isSuperAdminRole } from "@/lib/constants/roles";
import { sessionHasPermission } from "@/lib/permissions";

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
  canDelete: boolean;
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
  let canDelete = false;
  if (session?.user) {
    const isSuperAdmin = isSuperAdminRole(session.user.role);
    const isTargetSportManaged = session.user.managedSportIds?.includes(post.sportId);

    if (isSuperAdmin) {
      canEdit = true;
      canDelete = true;
    } else if (isTargetSportManaged) {
      if (sessionHasPermission(session, "posts:write")) canEdit = true;
      if (sessionHasPermission(session, "posts:full")) {
        canEdit = true;
        canDelete = true;
      }
    }
  }

  return {
    ...post,
    publishedAt: post.publishedAt?.toISOString() ?? null,
    createdAt: post.createdAt.toISOString(),
    canEdit,
    canDelete,
  };
}

export type PostDetailResult = PostDetailData | null;


