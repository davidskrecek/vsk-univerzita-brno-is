"use server";

import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { getRequiredSession, AuthError } from "@/lib/session";
import { requirePermission } from "@/lib/rbac";

const MAX_POST_IMAGE_SIZE = 25 * 1024 * 1024;
const MIME_EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
};

export async function uploadPostImageAction(formData: FormData): Promise<{ url?: string; error?: string }> {
  try {
    const session = await getRequiredSession();
    requirePermission(session, "posts:write");

    const file = formData.get("image");

    if (!(file instanceof File)) {
      return { error: "Soubor nebyl nalezen." };
    }

    if (!file.type.startsWith("image/")) {
      return { error: "Nahrát lze pouze obrázek." };
    }

    if (file.size > MAX_POST_IMAGE_SIZE) {
      return { error: "Obrázek je příliš velký. Zkuste menší soubor." };
    }

    const originalExtension = path.extname(file.name).toLowerCase();
    const extension = MIME_EXTENSIONS[file.type] ?? (originalExtension || ".png");
    const filename = `${randomUUID()}${extension}`;
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "post-images");
    const filePath = path.join(uploadsDir, filename);
    const buffer = Buffer.from(await file.arrayBuffer());

    await mkdir(uploadsDir, { recursive: true });
    await writeFile(filePath, buffer);

    return { url: `/uploads/post-images/${filename}` };
  } catch (e: any) {
    console.error("[POSTS] uploadImage error:", e);
    if (e instanceof AuthError) return { error: e.message };
    return { error: "Obrázek se nepodařilo nahrát." };
  }
}

