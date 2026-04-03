import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/admin/users/route";
import { GET } from "@/app/api/admin/users/stats/route";
import { mockSuperadminSession, mockSportManagerSession } from "@/__tests__/helpers/session";
import * as sessionModule from "@/lib/session";
import { AuthError } from "@/lib/session";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    editor: { count: vi.fn() },
    editorRole: { findMany: vi.fn() },
    $transaction: vi.fn(),
  },
}));

import { prisma } from "@/lib/prisma";

const validUser = {
  firstName: "Jana",
  lastName: "Nováková",
  email: "jana@vsk.cz",
  editorRoleId: 2,
  managedSportId: 1,
};

function makeRequest(body: object) {
  return new NextRequest("http://localhost:3000/api/admin/users", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

beforeEach(() => vi.clearAllMocks());

describe("POST /api/admin/users", () => {
  it("superadmin creates user and returns invitation token", async () => {
    vi.spyOn(sessionModule, "getRequiredSession").mockResolvedValue(mockSuperadminSession);
    (prisma.$transaction as ReturnType<typeof vi.fn>).mockImplementation(async (fn: (tx: typeof prisma) => unknown) =>
      fn({
        personnel: { create: vi.fn().mockResolvedValue({ id: 5, ...validUser }) },
        editor: { create: vi.fn() },
        trainer: { create: vi.fn() },
        official: { create: vi.fn() },
        accountInvitation: { create: vi.fn() },
      } as unknown as typeof prisma),
    );

    const res = await POST(makeRequest(validUser));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toHaveProperty("invitationToken");
    expect(typeof body.invitationToken).toBe("string");
  });

  it("sport_manager cannot create users", async () => {
    vi.spyOn(sessionModule, "getRequiredSession").mockResolvedValue(mockSportManagerSession);

    const res = await POST(makeRequest(validUser));
    expect(res.status).toBe(403);
  });

  it("returns 401 when unauthenticated", async () => {
    vi.spyOn(sessionModule, "getRequiredSession").mockRejectedValue(new AuthError(401, "Unauthorized"));

    const res = await POST(makeRequest(validUser));
    expect(res.status).toBe(401);
  });
});

describe("GET /api/admin/users/stats", () => {
  it("returns user counts grouped by role", async () => {
    vi.spyOn(sessionModule, "getRequiredSession").mockResolvedValue(mockSuperadminSession);
    (prisma.$transaction as ReturnType<typeof vi.fn>).mockResolvedValue([
      2,
      [
        { name: "superadmin", _count: { editors: 1 } },
        { name: "sport_manager", _count: { editors: 1 } },
      ],
    ]);

    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.total).toBe(2);
    expect(body.byRole).toHaveLength(2);
  });
});
