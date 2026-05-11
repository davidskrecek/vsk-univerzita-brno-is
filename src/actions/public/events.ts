"use server";

import { prisma } from "@/lib/prisma";
import { type UiEvent } from "@/components/features/events/eventUtils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserRole } from "@/lib/constants/roles";

export async function getEventDetail(id: number): Promise<UiEvent | null> {
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  const [event, session] = await Promise.all([
    prisma.event.findFirst({
      where: { id, isPublic: true },
      include: {
        sport: { select: { id: true, name: true } },
        links: { select: { url: true, alias: true } },
      },
    }),
    getServerSession(authOptions)
  ]);

  if (!event) {
    return null;
  }

  // Server-side authorization check
  let canEdit = false;
  if (session?.user) {
    if (session.user.role === UserRole.SUPERADMIN) {
      canEdit = true;
    } else if (event.authorPersonnelId === Number(session.user.personnelId)) {
      canEdit = true;
    } else if (
      (session.user.role === UserRole.SPORT_MANAGER || session.user.role === UserRole.EDITOR) && 
      session.user.managedSportIds?.includes(event.sportId)
    ) {
      canEdit = true;
    }
  }

  return {
    id: String(event.id),
    title: event.title,
    date: new Date(event.startTime).toISOString().split("T")[0],
    time: new Intl.DateTimeFormat("cs-CZ", {
      timeZone: "Europe/Prague",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date(event.startTime)),
    location: event.location ?? undefined,
    sport: event.sport.name,
    sportId: event.sport.id,
    description: event.description ?? undefined,
    startTimeIso: event.startTime.toISOString(),
    canEdit,
    links: event.links.map(l => ({ url: l.url, alias: l.alias })),
  };
}


