"use server";

import { prisma } from "@/lib/prisma";
import { getRequiredSession, AuthError } from "@/lib/session";
import { requirePermission } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import { CreatePostSchema, PostActionState } from "./schemas";
import { z } from "zod";

export async function createPostAction(
  _prevState: PostActionState,
  formData: FormData
): Promise<PostActionState> {
  try {
    const session = await getRequiredSession();
    // Use the new permission check
    requirePermission(session, "posts:write");

    const rawData = Object.fromEntries(formData.entries());
    const parsed = CreatePostSchema.safeParse(rawData);

    if (!parsed.success) {
      return {
        error: "Validace selhala",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const body = parsed.data;
    
    // Check sport scope (if not superadmin, must manage this sport)
    if (session.user.role !== "superadmin" && !session.user.managedSportIds.includes(body.sportId)) {
      throw new AuthError(403, "Nemáte oprávnění pro tento sport.");
    }

    const isPublished = body.isPublished ?? true;
    const imageUrl = body.imageUrl === "" ? undefined : body.imageUrl || undefined;
    const publishedAtInput = body.publishedAt === "" ? undefined : body.publishedAt;

    const post = await prisma.$transaction(async (tx) => {
      const p = await tx.post.create({
        data: {
          sportId: body.sportId,
          title: body.title,
          excerpt: body.excerpt,
          content: body.content,
          imageUrl,
          links: body.links ? { create: body.links } : undefined,
          isPublished,
          publishedAt: publishedAtInput ? new Date(publishedAtInput) : isPublished ? new Date() : null,
          authorPersonnelId: session.user.personnelId,
        },
      });

      await tx.auditLog.create({
        data: {
          actorPersonnelId: session.user.personnelId,
          entityType: "post",
          entityId: p.id,
          action: "create",
          payload: body as any,
        }
      });

      return p;
    });

    revalidatePath("/admin/posts");
    revalidatePath(`/posts`);

    return { success: true, data: { id: post.id } };
  } catch (e: any) {
    console.error("[POSTS] createPost error:", e);
    if (e instanceof AuthError) return { error: e.message };
    return { error: "Nepodařilo se vytvořit příspěvek." };
  }
}

