"use server";

import { prisma } from "@/lib/prisma";
import { type UiEvent } from "@/components/Events/eventUtils";

export async function getEventDetail(id: number): Promise<UiEvent | null> {
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  const event = await prisma.event.findFirst({
    where: { id, isPublic: true },
    include: {
      sport: { select: { id: true, name: true } },
    },
  });

  if (!event) {
    return null;
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
  };
}
