"use server";

import { prisma } from "@/lib/prisma";
import { getRequiredSession } from "@/lib/session";
import { requirePermission } from "@/lib/rbac";
import { FullUser } from "@/actions/admin/users/schemas";

export async function getUserById(id: number): Promise<FullUser | null> {
  const session = await getRequiredSession();
  requirePermission(session, "users:manage");

  return prisma.personnel.findUnique({
    where: { id },
    include: {
      sport: true,
      editor: {
        include: {
          editorRole: true,
          managedSports: {
            include: {
              sport: true,
            },
          },
        },
      },
      trainer: true,
      official: true,
      invitationsReceived: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    },
  }) as Promise<FullUser | null>;
}

