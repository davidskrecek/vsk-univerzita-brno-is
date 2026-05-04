import "server-only";
import { prisma } from "@/lib/prisma";
import type { EventApiItem, UiEvent } from "@/components/Events/eventUtils";

export async function getPublicEvents(): Promise<UiEvent[]> {
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
    id: String(event.id),
    title: event.title,
    date: new Date(event.startTime).toISOString().split("T")[0],
    time: new Date(event.startTime).toLocaleTimeString("cs-CZ", { timeZone: "Europe/Prague" }),
    location: event.location ?? undefined,
    sport: event.sport.name,
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
