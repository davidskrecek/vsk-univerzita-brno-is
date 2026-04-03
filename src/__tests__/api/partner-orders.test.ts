import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/partner-orders/route";
import { mockSuperadminSession } from "@/__tests__/helpers/session";
import * as sessionModule from "@/lib/session";
import { AuthError } from "@/lib/session";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    partnerOrder: { create: vi.fn(), findMany: vi.fn() },
  },
}));

import { prisma } from "@/lib/prisma";

function makePostRequest(body: object) {
  return new NextRequest("http://localhost:3000/api/partner-orders", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

beforeEach(() => vi.clearAllMocks());

describe("POST /api/partner-orders", () => {
  it("creates an order and returns 201", async () => {
    const order = { id: 1, partnerName: "Nutrend", email: "a@b.cz", details: "order", status: "submitted" };
    (prisma.partnerOrder.create as ReturnType<typeof vi.fn>).mockResolvedValue(order);

    const res = await POST(
      makePostRequest({ partnerName: "Nutrend", email: "a@b.cz", details: "order", requesterPersonnelId: 1 }),
    );

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.partnerName).toBe("Nutrend");
  });

  it("returns 500 on invalid body", async () => {
    const res = await POST(makePostRequest({ partnerName: "" }));
    expect(res.status).toBe(500);
  });
});

describe("GET /api/partner-orders", () => {
  it("returns orders for superadmin", async () => {
    vi.spyOn(sessionModule, "getRequiredSession").mockResolvedValue(mockSuperadminSession);
    (prisma.partnerOrder.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    const res = await GET();
    expect(res.status).toBe(200);
  });

  it("returns 403 for non-admin", async () => {
    vi.spyOn(sessionModule, "getRequiredSession").mockResolvedValue({
      user: { ...mockSuperadminSession.user, role: "sport_manager" },
    });

    const res = await GET();
    expect(res.status).toBe(403);
  });

  it("returns 401 when not logged in", async () => {
    vi.spyOn(sessionModule, "getRequiredSession").mockRejectedValue(new AuthError(401, "Unauthorized"));

    const res = await GET();
    expect(res.status).toBe(401);
  });
});
