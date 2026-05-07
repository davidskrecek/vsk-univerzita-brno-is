import "server-only";
import { prisma } from "@/lib/prisma";

export async function getUsers() {
    return prisma.personnel.findMany({
        include: {
            editor: {
                include: {
                    editorRole: true,
                },
            },
        }
    });
}

export type User = Awaited<ReturnType<typeof getUsers>>[number];
