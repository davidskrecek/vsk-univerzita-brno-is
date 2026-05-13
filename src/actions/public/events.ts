"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isSuperAdminRole } from "@/lib/constants/roles";
import { sessionHasPermission } from "@/lib/permissions";

export interface EventDetailData {
  id: string;
  title: string;
  date: string;
  time: string;
  location?: string;
  sport: string;
  sportId: number;
  description?: string;
  startTimeIso: string;
  canEdit: boolean;
  canDelete: boolean;
  links: Array<{ url: string; alias: string | null }>;
}

export async function getEventDetail(id: number): Promise<EventDetailData | null> {
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
  let canDelete = false;
  if (session?.user) {
    const isSuperAdmin = isSuperAdminRole(session.user.role);
    const isTargetSportManaged = session.user.managedSportIds?.includes(event.sportId);

    if (isSuperAdmin) {
      canEdit = true;
      canDelete = true;
    } else if (isTargetSportManaged) {
      if (sessionHasPermission(session, "events:write")) canEdit = true;
      if (sessionHasPermission(session, "events:full")) {
        canEdit = true;
        canDelete = true;
      }
    }
  }

  return {
    id: String(event.id),
    title: event.title,
    date: new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Prague",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(event.startTime)),
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
    canDelete,
    links: event.links.map(l => ({ url: l.url, alias: l.alias })),
  };
}


