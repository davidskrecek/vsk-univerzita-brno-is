import "server-only";
import { prisma } from "@/lib/prisma";

import { cache } from "react";

export const getRoles = cache(async () => {
    return prisma.editorRole.findMany();
});

export type Role = Awaited<ReturnType<typeof getRoles>>[number];

