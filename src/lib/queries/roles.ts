import "server-only";
import { prisma } from "@/lib/prisma";

export async function getRoles() {
    return prisma.editorRole.findMany();
}

export type Role = Awaited<ReturnType<typeof getRoles>>[number];

