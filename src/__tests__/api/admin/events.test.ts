import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/admin/events/route";
import { PATCH } from "@/app/api/admin/events/[id]/route";
import { mockSuperadminSession, mockSportManagerSession } from "@/__tests__/helpers/session";
import * as sessionModule from "@/lib/session";
import { AuthError } from "@/lib/session";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    event: { create: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
  },
}));

import { prisma } from "@/lib/prisma";

const validEvent = {
  sportId: 1,
  title: "Match day",
  startTime: "2026-05-10T09:00:00.000Z",
  location: "Brno stadium",
};

function makeRequest(body: object, url = "http://localhost:3000/api/admin/events") {
  return new NextRequest(url, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

beforeEach(() => vi.clearAllMocks());

describe("POST /api/admin/events", () => {
  it("superadmin creates event", async () => {
    vi.spyOn(sessionModule, "getRequiredSession").mockResolvedValue(mockSuperadminSession);
    (prisma.event.create as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 1, ...validEvent });

    const res = await POST(makeRequest(validEvent));
    expect(res.status).toBe(201);
  });

  it("sport_manager blocked for wrong sport", async () => {
    vi.spyOn(sessionModule, "getRequiredSession").mockResolvedValue(mockSportManagerSession);

    const res = await POST(makeRequest({ ...validEvent, sportId: 99 }));
    expect(res.status).toBe(403);
  });

  it("returns 401 when unauthenticated", async () => {
    vi.spyOn(sessionModule, "getRequiredSession").mockRejectedValue(new AuthError(401, "Unauthorized"));

    const res = await POST(makeRequest(validEvent));
    expect(res.status).toBe(401);
  });
});

describe("PATCH /api/admin/events/:id", () => {
  it("superadmin can cancel an event", async () => {
    vi.spyOn(sessionModule, "getRequiredSession").mockResolvedValue(mockSuperadminSession);
    (prisma.event.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 1, sportId: 1 });
    (prisma.event.update as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 1, isCancelled: true });

    const req = new NextRequest("http://localhost:3000/api/admin/events/1", {
      method: "PATCH",
      body: JSON.stringify({ isCancelled: true }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(200);
  });

  it("returns 404 when event does not exist", async () => {
    vi.spyOn(sessionModule, "getRequiredSession").mockResolvedValue(mockSuperadminSession);
    (prisma.event.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const req = new NextRequest("http://localhost:3000/api/admin/events/999", {
      method: "PATCH",
      body: JSON.stringify({ title: "X" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: "999" }) });
    expect(res.status).toBe(404);
  });
});
