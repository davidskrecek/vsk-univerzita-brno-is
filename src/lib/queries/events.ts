import "server-only";
import { prisma } from "@/lib/prisma";
import type { UiEvent } from "@/components/features/events/eventUtils";

export async function getPublicEvents(sportName?: string, year?: number, month?: number): Promise<UiEvent[]> {
  const where: any = {
    isPublic: true,
    isCancelled: false,
    sport: sportName ? { name: sportName } : undefined
  };

  if (year && month) {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
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
      endTime: true,
      location: true,
      eventType: true,
      isPublic: true,
      isCancelled: true,
      sport: { select: { id: true, name: true } },
    },
    orderBy: { startTime: "asc" },
  });

  return events.map((event) => ({
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
  }));
}

export async function getEventById(id: number) {
  return prisma.event.findFirst({
    where: { id, isPublic: true },
    include: {
      sport: { select: { id: true, name: true } },
      author: { select: { id: true, firstName: true, lastName: true } },
      links: { select: { url: true, alias: true } },
    },
  });
}

export type PublicEvent = Awaited<ReturnType<typeof getPublicEvents>>[number];

