import "server-only";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import type { UiEvent } from "@/components/features/events/eventUtils";

export async function getPublicEvents(sportName?: string, year?: number, month?: number, limit?: number): Promise<UiEvent[]> {
  const where: any = {
    isPublic: true,
    isCancelled: false,
    sport: sportName ? { name: sportName } : undefined
  };

  if (year && month) {
    const startOfMonth = new Date(year, month - 1, 1);
    startOfMonth.setDate(startOfMonth.getDate() - 1);

    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
    endOfMonth.setDate(endOfMonth.getDate() + 2);

    where.startTime = {
      gte: startOfMonth,
      lte: endOfMonth
    };
  } else {
    where.startTime = { gte: new Date() };
  }

  const events = await prisma.event.findMany({
    where,
    select: {
      id: true,
      title: true,
      description: true,
      startTime: true,
      location: true,
      eventType: true,
      isPublic: true,
      isCancelled: true,
      sport: { select: { id: true, name: true } },
    },
    orderBy: { startTime: "asc" },
    take: limit,
  });

  const mapped = events.map((event) => ({
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
  }));

  if (year && month) {
    const prefix = `${year}-${String(month).padStart(2, '0')}`;
    return mapped.filter(e => e.date.startsWith(prefix));
  }

  return mapped;
}

export type PublicEvent = Awaited<ReturnType<typeof getPublicEvents>>[number];

