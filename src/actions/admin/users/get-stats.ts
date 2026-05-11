"use server";

import { prisma } from "@/lib/prisma";
import { getRequiredSession } from "@/lib/session";
import { requirePermission } from "@/lib/rbac";

export async function getUserStatsAction() {
  try {
    const session = await getRequiredSession();
    requirePermission(session, "users:manage");

    const [total, byRole] = await prisma.$transaction([
      prisma.editor.count(),
      prisma.editorRole.findMany({
        select: {
          name: true,
          _count: { select: { editors: true } },
        },
      }),
    ]);

    return {
      success: true,
      data: {
        total,
        byRole: byRole.map((r) => ({ role: r.name, count: r._count.editors })),
      }
    };
  } catch (e: any) {
    console.error(e);
    return { success: false, error: e.message || "Failed to fetch stats" };
  }
}

