"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getRequiredSession, AuthError } from "@/lib/session";
import { requireRole, requireSportScope } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

export type EventActionState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  data?: { id: number };
};

const createEventSchema = z.object({
  sportId: z.coerce.number().int().positive(),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().optional().or(z.literal("")),
  location: z.string().max(255).optional(),
  eventType: z.string().max(50).optional(),
  ticketUrl: z.string().url().optional().or(z.literal("")),
  mapUrl: z.string().url().optional().or(z.literal("")),
  isPublic: z.preprocess((v) => v === "true" || v === true, z.boolean()).optional(),
  links: z
    .preprocess(
      (v) => (typeof v === "string" ? JSON.parse(v) : v),
      z.array(z.object({ url: z.string().url(), alias: z.string().max(255).optional() }))
    )
    .optional(),
});

const updateEventSchema = z.object({
  id: z.coerce.number().int().positive(),
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional().nullable().or(z.literal("")),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional().nullable().or(z.literal("")),
  location: z.string().max(255).optional().nullable().or(z.literal("")),
  eventType: z.string().max(50).optional().nullable().or(z.literal("")),
  ticketUrl: z.string().url().optional().nullable().or(z.literal("")),
  mapUrl: z.string().url().optional().nullable().or(z.literal("")),
  isPublic: z.preprocess((v) => v === "true" || v === true, z.boolean()).optional(),
  isCancelled: z.preprocess((v) => v === "true" || v === true, z.boolean()).optional(),
  links: z
    .preprocess(
      (v) => (typeof v === "string" ? JSON.parse(v) : v),
      z.array(z.object({ url: z.string().url(), alias: z.string().max(255).optional() }))
    )
    .optional(),
});

function parseFormData(formData: FormData): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  formData.forEach((value, key) => {
    if (value !== "") {
      result[key] = value;
    }
  });
  return result;
}

export async function createEvent(
  _prevState: EventActionState,
  formData: FormData
): Promise<EventActionState> {
  try {
    const session = await getRequiredSession();
    requireRole(session, "superadmin", "sport_manager");

    const rawValues = parseFormData(formData);
    const parsed = createEventSchema.safeParse(rawValues);

    if (!parsed.success) {
      return {
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const body = parsed.data;
    requireSportScope(session, body.sportId);

    const endTime = body.endTime === "" ? null : body.endTime ? new Date(body.endTime) : null;
    const ticketUrl = body.ticketUrl === "" ? undefined : body.ticketUrl;
    const mapUrl = body.mapUrl === "" ? undefined : body.mapUrl;

    const event = await prisma.event.create({
      data: {
        sportId: body.sportId,
        title: body.title,
        description: body.description,
        startTime: new Date(body.startTime),
        endTime,
        location: body.location,
        eventType: body.eventType,
        ticketUrl,
        mapUrl,
        isPublic: body.isPublic,
        links: body.links ? { create: body.links } : undefined,
        authorPersonnelId: session.user.personnelId,
      },
    });

    revalidatePath("/admin/events");
    revalidatePath(`/events`);

    return { success: true, data: { id: event.id } };
  } catch (e) {
    if (e instanceof z.ZodError) {
      return {
        error: "Validation failed",
        fieldErrors: e.flatten().fieldErrors as Record<string, string[]>,
      };
    }
    if (e instanceof AuthError) {
      return { error: e.message };
    }
    console.error(e);
    return { error: "Failed to create event" };
  }
}

export async function updateEvent(
  _prevState: EventActionState,
  formData: FormData
): Promise<EventActionState> {
  try {
    const session = await getRequiredSession();
    requireRole(session, "superadmin", "sport_manager");

    const rawValues = parseFormData(formData);
    const parsed = updateEventSchema.safeParse(rawValues);

    if (!parsed.success) {
      return {
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const body = parsed.data;
    const eventId = body.id;

    const existing = await prisma.event.findUnique({ where: { id: eventId } });
    if (!existing) {
      return { error: "Not found" };
    }

    requireSportScope(session, existing.sportId);

    const startTime = body.startTime ? new Date(body.startTime) : undefined;
    const endTime =
      body.endTime === "" || body.endTime === null
        ? null
        : body.endTime
          ? new Date(body.endTime)
          : undefined;

    const description = body.description === "" ? null : body.description;
    const location = body.location === "" ? null : body.location;
    const eventType = body.eventType === "" ? null : body.eventType;
    const ticketUrl = body.ticketUrl === "" ? null : body.ticketUrl;
    const mapUrl = body.mapUrl === "" ? null : body.mapUrl;

    const updated = await prisma.event.update({
      where: { id: eventId },
      data: {
        title: body.title,
        description,
        startTime,
        endTime,
        location,
        eventType,
        ticketUrl,
        mapUrl,
        isPublic: body.isPublic,
        isCancelled: body.isCancelled,
        links: body.links ? { deleteMany: {}, create: body.links } : undefined,
      },
    });

    revalidatePath("/admin/events");
    revalidatePath(`/events/${eventId}`);
    revalidatePath(`/events`);

    return { success: true, data: { id: updated.id } };
  } catch (e) {
    if (e instanceof z.ZodError) {
      return {
        error: "Validation failed",
        fieldErrors: e.flatten().fieldErrors as Record<string, string[]>,
      };
    }
    if (e instanceof AuthError) {
      return { error: e.message };
    }
    console.error(e);
    return { error: "Failed to update event" };
  }
}
