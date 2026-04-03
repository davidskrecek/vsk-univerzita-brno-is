import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/posts/route";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    post: { count: vi.fn(), findMany: vi.fn() },
    $transaction: vi.fn(),
  },
}));

import { prisma } from "@/lib/prisma";

const mockPosts = [
  {
    id: 1,
    title: "Test post",
    excerpt: "excerpt",
    imageUrl: null,
    publishedAt: "2026-04-01T00:00:00.000Z",
    createdAt: "2026-04-01T00:00:00.000Z",
    sport: { id: 1, name: "Atletika" },
    author: { id: 1, firstName: "Adam", lastName: "Novák" },
  },
];

function makeRequest(params: Record<string, string> = {}) {
  const url = new URL("http://localhost:3000/api/posts");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url);
}

beforeEach(() => vi.clearAllMocks());

describe("GET /api/posts", () => {
  it("returns paginated posts", async () => {
    (prisma.$transaction as ReturnType<typeof vi.fn>).mockResolvedValue([1, mockPosts]);

    const res = await GET(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toEqual(mockPosts);
    expect(body.total).toBe(1);
    expect(body.page).toBe(1);
  });

  it("filters by sportId", async () => {
    (prisma.$transaction as ReturnType<typeof vi.fn>).mockResolvedValue([0, []]);

    const res = await GET(makeRequest({ sportId: "99" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(0);
  });

  it("returns 500 on DB error", async () => {
    (prisma.$transaction as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("fail"));

    const res = await GET(makeRequest());
    expect(res.status).toBe(500);
  });
});
