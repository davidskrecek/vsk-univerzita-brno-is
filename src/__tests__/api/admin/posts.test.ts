import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/admin/posts/route";
import { PATCH } from "@/app/api/admin/posts/[id]/route";
import { mockSuperadminSession, mockSportManagerSession } from "@/__tests__/helpers/session";
import * as sessionModule from "@/lib/session";
import { AuthError } from "@/lib/session";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    post: { create: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
  },
}));

import { prisma } from "@/lib/prisma";

function makeRequest(body: object, method = "POST") {
  return new NextRequest("http://localhost:3000/api/admin/posts", {
    method,
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

const validPost = {
  sportId: 1,
  title: "New post",
  content: "Content",
  isPublished: true,
  links: [{ url: "https://example.com", alias: "Example" }],
};

beforeEach(() => vi.clearAllMocks());

describe("POST /api/admin/posts", () => {
  it("superadmin can create a post for any sport", async () => {
    vi.spyOn(sessionModule, "getRequiredSession").mockResolvedValue(mockSuperadminSession);
    const created = { id: 1, ...validPost };
    (prisma.post.create as ReturnType<typeof vi.fn>).mockResolvedValue(created);

    const res = await POST(makeRequest(validPost));
    expect(res.status).toBe(201);
  });

  it("sport_manager can create for their sport", async () => {
    vi.spyOn(sessionModule, "getRequiredSession").mockResolvedValue(mockSportManagerSession);
    (prisma.post.create as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 2, ...validPost });

    const res = await POST(makeRequest(validPost));
    expect(res.status).toBe(201);
  });

  it("sport_manager is blocked for a different sport", async () => {
    vi.spyOn(sessionModule, "getRequiredSession").mockResolvedValue(mockSportManagerSession);

    const res = await POST(makeRequest({ ...validPost, sportId: 99 }));
    expect(res.status).toBe(403);
  });

  it("returns 401 when unauthenticated", async () => {
    vi.spyOn(sessionModule, "getRequiredSession").mockRejectedValue(new AuthError(401, "Unauthorized"));

    const res = await POST(makeRequest(validPost));
    expect(res.status).toBe(401);
  });
});

describe("PATCH /api/admin/posts/:id", () => {
  it("returns 404 when post not found", async () => {
    vi.spyOn(sessionModule, "getRequiredSession").mockResolvedValue(mockSuperadminSession);
    (prisma.post.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const req = new NextRequest("http://localhost:3000/api/admin/posts/99", {
      method: "PATCH",
      body: JSON.stringify({ title: "Updated" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: "99" }) });
    expect(res.status).toBe(404);
  });

  it("sport_manager blocked from editing another sport's post", async () => {
    vi.spyOn(sessionModule, "getRequiredSession").mockResolvedValue(mockSportManagerSession);
    (prisma.post.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 5, sportId: 99 });

    const req = new NextRequest("http://localhost:3000/api/admin/posts/5", {
      method: "PATCH",
      body: JSON.stringify({ title: "Changed" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: "5" }) });
    expect(res.status).toBe(403);
  });
});
