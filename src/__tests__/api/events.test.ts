import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/events/route";

vi.mock("@/lib/prisma", () => ({
  prisma: { event: { findMany: vi.fn() } },
}));

import { prisma } from "@/lib/prisma";

const mockEvents = [
  {
    id: 1,
    title: "Oblastní přebor",
    startTime: new Date("2026-05-10T09:00:00"),
    sport: { id: 1, name: "Atletika" },
    isPublic: true,
    isCancelled: false,
  },
];

function makeRequest(params: Record<string, string> = {}) {
  const url = new URL("http://localhost:3000/api/events");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url);
}

beforeEach(() => vi.clearAllMocks());

describe("GET /api/events", () => {
  it("returns events", async () => {
    (prisma.event.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(mockEvents);

    const res = await GET(makeRequest());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(1);
  });

  it("passes from/to/sportId filters to query", async () => {
    (prisma.event.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    await GET(makeRequest({ from: "2026-05-01", to: "2026-05-31", sportId: "1" }));

    const call = (prisma.event.findMany as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(call.where.startTime.gte).toBeInstanceOf(Date);
    expect(call.where.startTime.lte).toBeInstanceOf(Date);
    expect(call.where.sportId).toBe(1);
  });

  it("returns 500 on DB error", async () => {
    (prisma.event.findMany as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("fail"));

    const res = await GET(makeRequest());
    expect(res.status).toBe(500);
  });
});
