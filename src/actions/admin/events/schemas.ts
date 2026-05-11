import { z } from "zod";

export type EventActionState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  data?: { id: number };
};

export const EventLinkSchema = z.object({
  url: z.string().url("Neplatná URL"),
  alias: z.string().max(255).optional().nullable(),
});

export const CreateEventSchema = z.object({
  sportId: z.coerce.number().int().positive("Vyberte sport"),
  title: z.string().min(1, "Titulek je povinný").max(255),
  description: z.string().optional().nullable().or(z.literal("")),
  startTime: z.string().datetime("Neplatný čas zahájení"),
  endTime: z.string().datetime().optional().nullable().or(z.literal("")),
  location: z.string().max(255).optional().nullable().or(z.literal("")),
  eventType: z.string().max(50).optional().nullable().or(z.literal("")),
  ticketUrl: z.string().url().optional().nullable().or(z.literal("")),
  mapUrl: z.string().url().optional().nullable().or(z.literal("")),
  isPublic: z.preprocess((v) => v === "true" || v === true, z.boolean()).optional(),
  links: z
    .preprocess(
      (v) => (typeof v === "string" ? JSON.parse(v) : v),
      z.array(EventLinkSchema)
    )
    .optional(),
});

export const UpdateEventSchema = CreateEventSchema.extend({
  id: z.coerce.number().int().positive(),
  isCancelled: z.preprocess((v) => v === "true" || v === true, z.boolean()).optional(),
});

export type CreateEventValues = z.infer<typeof CreateEventSchema>;
export type UpdateEventValues = z.infer<typeof UpdateEventSchema>;

