import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/sports/route";

vi.mock("@/lib/prisma", () => ({ prisma: { sport: { findMany: vi.fn() } } }));

import { prisma } from "@/lib/prisma";

const mockSports = [
  { id: 1, name: "Atletika", isCompetitive: true, description: "Test" },
  { id: 2, name: "Tenis", isCompetitive: false, description: null },
];

beforeEach(() => vi.clearAllMocks());

describe("GET /api/sports", () => {
  it("returns list of sports", async () => {
    (prisma.sport.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(mockSports);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual(mockSports);
    expect(prisma.sport.findMany).toHaveBeenCalledOnce();
  });

  it("returns 500 when database throws", async () => {
    (prisma.sport.findMany as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("DB error"));

    const res = await GET();
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body).toHaveProperty("error");
  });
});
