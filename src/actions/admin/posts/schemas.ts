import { z } from "zod";

export type PostActionState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  data?: { id: number };
};

export const PostLinkSchema = z.object({
  url: z.url("Neplatná URL"),
  alias: z.string().max(255).optional().nullable(),
});

export const CreatePostSchema = z.object({
  sportId: z.coerce.number().int().positive("Vyberte sport"),
  title: z.string().min(1, "Titulek je povinný").max(255),
  excerpt: z.string().optional(),
  content: z.string().min(1, "Obsah je povinný"),
  imageUrl: z.string().optional().nullable().or(z.literal("")),
  isPublished: z.preprocess((v) => v === "true" || v === true, z.boolean()).optional(),
  publishedAt: z.string().optional().or(z.literal("")),
  links: z
    .preprocess(
      (v) => (typeof v === "string" ? JSON.parse(v) : v),
      z.array(PostLinkSchema)
    )
    .optional(),
});

export const UpdatePostSchema = CreatePostSchema.extend({
  id: z.coerce.number().int().positive(),
  title: z.string().min(1).max(255).optional(),
  content: z.string().min(1).optional(),
});

export type CreatePostValues = z.infer<typeof CreatePostSchema>;
export type UpdatePostValues = z.infer<typeof UpdatePostSchema>;

