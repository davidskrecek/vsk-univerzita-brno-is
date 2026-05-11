"use server";

import { prisma } from "@/lib/prisma";
import { getRequiredSession, AuthError } from "@/lib/session";
import { requirePermission } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import { unlink } from "fs/promises";
import path from "path";

export async function deletePostAction(postId: number): Promise<{ success?: boolean; error?: string }> {
  try {
    const session = await getRequiredSession();
    // For deleting, we might want a higher permission or 'full' access
    requirePermission(session, "posts:full");

    if (!Number.isInteger(postId) || postId <= 0) {
      return { error: "Neplatné ID příspěvku" };
    }

    const existing = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, sportId: true, imageUrl: true, authorPersonnelId: true },
    });

    if (!existing) return { error: "Příspěvek nebyl nalezen." };

    // AUTHORIZATION CHECK
    let canDelete = false;
    if (session.user.role === "superadmin") {
      canDelete = true;
    } else if (existing.authorPersonnelId === Number(session.user.personnelId)) {
      canDelete = true;
    } else if (session.user.managedSportIds.includes(existing.sportId)) {
      canDelete = true;
    }

    if (!canDelete) throw new AuthError(403, "Nemáte oprávnění ke smazání tohoto příspěvku.");

    // Clean up image file
    if (existing.imageUrl?.startsWith("/uploads/post-images/")) {
      const filePath = path.join(process.cwd(), "public", existing.imageUrl);
      try {
        await unlink(filePath);
      } catch {
        // Ignore missing files
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.post.delete({ where: { id: postId } });

      await tx.auditLog.create({
        data: {
          actorPersonnelId: session.user.personnelId,
          entityType: "post",
          entityId: postId,
          action: "delete",
        }
      });
    });

    revalidatePath("/admin/posts");
    revalidatePath("/posts");

    return { success: true };
  } catch (e: any) {
    console.error("[POSTS] deletePost error:", e);
    if (e instanceof AuthError) return { error: e.message };
    return { error: "Nepodařilo se smazat příspěvek." };
  }
}

