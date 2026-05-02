import "server-only";
import { prisma } from "@/lib/prisma";
import type { EventApiItem } from "@/components/Events/eventUtils";

export async function getPublicEvents(): Promise<EventApiItem[]> {
  const events = await prisma.event.findMany({
    where: {
      isPublic: true,
      isCancelled: false,
    },
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
    ...event,
    startTime: event.startTime.toISOString(),
    endTime: event.endTime?.toISOString() ?? null,
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
