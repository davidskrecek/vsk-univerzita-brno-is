import { describe, it, expect, vi, beforeEach } from "vitest";
import { createPost, updatePost } from "@/actions/admin/posts";
import { mockSuperadminSession, mockSportManagerSession } from "@/__tests__/helpers/session";
import * as sessionModule from "@/lib/session";
import { AuthError } from "@/lib/session";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    post: { create: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { prisma } from "@/lib/prisma";

function makeFormData(data: Record<string, unknown>): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null) {
      if (typeof value === "object" && !Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    }
  }
  return formData;
}

const validPost = {
  sportId: 1,
  title: "New post",
  content: "Content",
  isPublished: true,
  links: [{ url: "https://example.com", alias: "Example" }],
};

beforeEach(() => vi.clearAllMocks());

describe("createPost", () => {
  it("superadmin can create a post for any sport", async () => {
    vi.spyOn(sessionModule, "getRequiredSession").mockResolvedValue(mockSuperadminSession);
    const created = { id: 1, ...validPost };
    (prisma.post.create as ReturnType<typeof vi.fn>).mockResolvedValue(created);

    const result = await createPost({}, makeFormData(validPost));
    expect(result.success).toBe(true);
    expect(result.data?.id).toBe(1);
  });

  it("sport_manager can create for their sport", async () => {
    vi.spyOn(sessionModule, "getRequiredSession").mockResolvedValue(mockSportManagerSession);
    (prisma.post.create as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 2, ...validPost });

    const result = await createPost({}, makeFormData(validPost));
    expect(result.success).toBe(true);
  });

  it("sport_manager is blocked for a different sport", async () => {
    vi.spyOn(sessionModule, "getRequiredSession").mockResolvedValue(mockSportManagerSession);

    const result = await createPost({}, makeFormData({ ...validPost, sportId: 99 }));
    expect(result.error).toBe("Forbidden: sport scope mismatch");
  });

  it("returns error when unauthenticated", async () => {
    vi.spyOn(sessionModule, "getRequiredSession").mockRejectedValue(new AuthError(401, "Unauthorized"));

    const result = await createPost({}, makeFormData(validPost));
    expect(result.error).toBe("Unauthorized");
  });
});

describe("updatePost", () => {
  it("returns error when post not found", async () => {
    vi.spyOn(sessionModule, "getRequiredSession").mockResolvedValue(mockSuperadminSession);
    (prisma.post.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const result = await updatePost({}, makeFormData({ id: 99, title: "Updated" }));
    expect(result.error).toBe("Not found");
  });

  it("sport_manager blocked from editing another sport's post", async () => {
    vi.spyOn(sessionModule, "getRequiredSession").mockResolvedValue(mockSportManagerSession);
    (prisma.post.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 5, sportId: 99 });

    const result = await updatePost({}, makeFormData({ id: 5, title: "Changed" }));
    expect(result.error).toBe("Forbidden: sport scope mismatch");
  });
});
