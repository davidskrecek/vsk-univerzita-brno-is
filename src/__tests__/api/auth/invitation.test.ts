import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/auth/invitation/accept/route";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    accountInvitation: { findUnique: vi.fn(), update: vi.fn() },
    editor: { update: vi.fn() },
    $transaction: vi.fn(),
  },
}));

import { prisma } from "@/lib/prisma";

function makeRequest(body: object) {
  return new NextRequest("http://localhost:3000/api/auth/invitation/accept", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

beforeEach(() => vi.clearAllMocks());

describe("POST /api/auth/invitation/accept", () => {
  it("returns 400 for missing token", async () => {
    const res = await POST(makeRequest({ password: "Newpass1!" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for expired invitation", async () => {
    (prisma.accountInvitation.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 1,
      personnelId: 1,
      tokenHash: "hash",
      usedAt: null,
      expiresAt: new Date(Date.now() - 1000),
    });

    const res = await POST(makeRequest({ token: "any", password: "Newpass1!" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for already-used invitation", async () => {
    (prisma.accountInvitation.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 1,
      personnelId: 1,
      tokenHash: "hash",
      usedAt: new Date(),
      expiresAt: new Date(Date.now() + 86400000),
    });

    const res = await POST(makeRequest({ token: "any", password: "Newpass1!" }));
    expect(res.status).toBe(400);
  });

  it("accepts a valid token and updates the password", async () => {
    (prisma.accountInvitation.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 1,
      personnelId: 1,
      tokenHash: "hash",
      usedAt: null,
      expiresAt: new Date(Date.now() + 86400000),
    });
    (prisma.$transaction as ReturnType<typeof vi.fn>).mockResolvedValue([{}, {}]);

    const res = await POST(makeRequest({ token: "valid-token", password: "Newpass1!" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });
});
