import { prisma } from "@/lib/prisma";
import { apiError, ok } from "@/lib/api";
import { getRequiredSession } from "@/lib/session";
import { requireRole } from "@/lib/rbac";

export async function GET() {
  try {
    const session = await getRequiredSession();
    requireRole(session, "superadmin");

    const [total, byRole] = await prisma.$transaction([
      prisma.editor.count(),
      prisma.editorRole.findMany({
        select: {
          name: true,
          _count: { select: { editors: true } },
        },
      }),
    ]);

    return ok({
      total,
      byRole: byRole.map((r) => ({ role: r.name, count: r._count.editors })),
    });
  } catch (e) {
    return apiError(e);
  }
}
