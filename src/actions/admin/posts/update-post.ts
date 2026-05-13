"use server";

import { prisma } from "@/lib/prisma";
import { getRequiredSession, AuthError } from "@/lib/session";
import { requirePermission } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import { UpdatePostSchema, PostActionState } from "./schemas";
import { UserRole, isEditorialRole } from "@/lib/constants/roles";

export async function updatePostAction(
  _prevState: PostActionState,
  formData: FormData
): Promise<PostActionState> {
  try {
    const session = await getRequiredSession();
    requirePermission(session, "posts:write");

    const rawData = Object.fromEntries(formData.entries());
    const parsed = UpdatePostSchema.safeParse(rawData);

    if (!parsed.success) {
      return {
        error: "Validace selhala",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const body = parsed.data;
    const postId = body.id;

    const existing = await prisma.post.findUnique({ where: { id: postId } });
    if (!existing) return { error: "Příspěvek nebyl nalezen." };

    // AUTHORIZATION CHECK
    let canEdit = false;
    if (session.user.role === UserRole.SUPERADMIN) {
      canEdit = true;
    } else if (existing.authorPersonnelId === Number(session.user.personnelId)) {
      canEdit = true;
    } else if (isEditorialRole(session.user.role) && session.user.managedSportIds.includes(existing.sportId)) {
      canEdit = true;
    }

    if (!canEdit) throw new AuthError(403, "Nemáte oprávnění k úpravě tohoto příspěvku.");

    const imageUrl = body.imageUrl === "" ? null : body.imageUrl || undefined;
    const publishedAtRaw = body.publishedAt;
    let publishedAt: Date | null | undefined = undefined;
    if (publishedAtRaw !== undefined) {
      publishedAt = publishedAtRaw === "" || publishedAtRaw === null ? null : new Date(publishedAtRaw);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const u = await tx.post.update({
        where: { id: postId },
        data: {
          title: body.title,
          excerpt: body.excerpt,
          content: body.content,
          imageUrl,
          isPublished: body.isPublished,
          links: body.links ? { deleteMany: {}, create: body.links } : undefined,
          publishedAt,
        },
      });

      await tx.auditLog.create({
        data: {
          actorPersonnelId: session.user.personnelId,
          entityType: "post",
          entityId: postId,
          action: "update",
          payload: JSON.parse(JSON.stringify(body)),
        }
      });

      return u;
    });

    revalidatePath(`/posts/${postId}`);
    revalidatePath(`/posts`);
    revalidatePath("/");

    return { success: true, data: { id: updated.id } };
  } catch (e) {
    console.error("[POSTS] updatePost error:", e);
    if (e instanceof AuthError) return { error: e.message };
    return { error: "Nepodařilo se aktualizovat příspěvek." };
  }
}


