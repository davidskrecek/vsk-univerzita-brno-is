import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/contacts/route";

vi.mock("@/lib/prisma", () => ({
  prisma: { personnel: { findMany: vi.fn() } },
}));

import { prisma } from "@/lib/prisma";

const mockPersonnel = [
  {
    id: 1,
    firstName: "Petr",
    lastName: "Dvořák",
    email: "petr@vsk.cz",
    phone: null,
    sport: { id: 1, name: "Atletika" },
    trainer: { category: "I. třída" },
    official: null,
  },
];

function makeRequest(params: Record<string, string> = {}) {
  const url = new URL("http://localhost:3000/api/contacts");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url);
}

beforeEach(() => vi.clearAllMocks());

describe("GET /api/contacts", () => {
  it("returns personnel list", async () => {
    (prisma.personnel.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(mockPersonnel);

    const res = await GET(makeRequest());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(1);
    expect(body[0].trainer).toMatchObject({ category: "I. třída" });
  });

  it("filters by sportId", async () => {
    (prisma.personnel.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    await GET(makeRequest({ sportId: "2" }));

    const call = (prisma.personnel.findMany as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(call.where.sportId).toBe(2);
  });

  it("returns 500 on DB error", async () => {
    (prisma.personnel.findMany as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("fail"));

    const res = await GET(makeRequest());
    expect(res.status).toBe(500);
  });
});
