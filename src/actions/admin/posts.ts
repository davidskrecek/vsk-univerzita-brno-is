"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getRequiredSession, AuthError } from "@/lib/session";
import { requireRole, requireSportScope } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

export type PostActionState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  data?: { id: number };
};

const createPostSchema = z.object({
  sportId: z.coerce.number().int().positive(),
  title: z.string().min(1).max(255),
  excerpt: z.string().optional(),
  content: z.string().min(1),
  imageUrl: z.string().url().optional().or(z.literal("")),
  isPublished: z.preprocess((v) => v === "true" || v === true, z.boolean()).optional(),
  publishedAt: z.string().datetime().optional().or(z.literal("")),
  links: z
    .preprocess(
      (v) => (typeof v === "string" ? JSON.parse(v) : v),
      z.array(z.object({ url: z.string().url(), alias: z.string().max(255).optional() }))
    )
    .optional(),
});

const updatePostSchema = z.object({
  id: z.coerce.number().int().positive(),
  title: z.string().min(1).max(255).optional(),
  excerpt: z.string().optional(),
  content: z.string().min(1).optional(),
  imageUrl: z.string().url().optional().nullable().or(z.literal("")),
  isPublished: z.preprocess((v) => v === "true" || v === true, z.boolean()).optional(),
  publishedAt: z.string().datetime().optional().nullable().or(z.literal("")),
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

export async function createPost(
  _prevState: PostActionState,
  formData: FormData
): Promise<PostActionState> {
  try {
    const session = await getRequiredSession();
    requireRole(session, "superadmin", "sport_manager");

    const rawValues = parseFormData(formData);
    const parsed = createPostSchema.safeParse(rawValues);

    if (!parsed.success) {
      return {
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const body = parsed.data;
    requireSportScope(session, body.sportId);

    const isPublished = body.isPublished ?? true;
    const imageUrl = body.imageUrl === "" ? undefined : body.imageUrl;
    const publishedAtInput = body.publishedAt === "" ? undefined : body.publishedAt;

    const post = await prisma.post.create({
      data: {
        sportId: body.sportId,
        title: body.title,
        excerpt: body.excerpt,
        content: body.content,
        imageUrl,
        links: body.links ? { create: body.links } : undefined,
        isPublished,
        publishedAt: publishedAtInput ? new Date(publishedAtInput) : isPublished ? new Date() : null,
        authorPersonnelId: session.user.personnelId,
      },
    });

    revalidatePath("/admin/posts");
    revalidatePath(`/posts`);

    return { success: true, data: { id: post.id } };
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
    return { error: "Failed to create post" };
  }
}

export async function updatePost(
  _prevState: PostActionState,
  formData: FormData
): Promise<PostActionState> {
  try {
    const session = await getRequiredSession();
    requireRole(session, "superadmin", "sport_manager");

    const rawValues = parseFormData(formData);
    const parsed = updatePostSchema.safeParse(rawValues);

    if (!parsed.success) {
      return {
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const body = parsed.data;
    const postId = body.id;

    const existing = await prisma.post.findUnique({ where: { id: postId } });
    if (!existing) {
      return { error: "Not found" };
    }

    requireSportScope(session, existing.sportId);

    const imageUrl = body.imageUrl === "" ? null : body.imageUrl;
    const publishedAtRaw = body.publishedAt;
    let publishedAt: Date | null | undefined = undefined;
    if (publishedAtRaw !== undefined) {
      publishedAt = publishedAtRaw === "" || publishedAtRaw === null ? null : new Date(publishedAtRaw);
    }

    const updated = await prisma.post.update({
      where: { id: postId },
      data: {
        title: body.title,
        excerpt: body.excerpt,
        content: body.content,
        imageUrl,
        isPublished: body.isPublished,
        links: body.links ? { deleteMany: {}, create: body.links } : undefined,
        publishedAt,
      },
    });

    revalidatePath("/admin/posts");
    revalidatePath(`/posts/${postId}`);
    revalidatePath(`/posts`);

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
    return { error: "Failed to update post" };
  }
}
