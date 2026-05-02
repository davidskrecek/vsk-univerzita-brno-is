import { describe, it, expect, vi, beforeEach } from "vitest";
import { createUser, getUserStats } from "@/actions/admin/users";
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

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { prisma } from "@/lib/prisma";

const validUser = {
  firstName: "Jana",
  lastName: "Nováková",
  email: "jana@vsk.cz",
  editorRoleId: 2,
  managedSportIds: [1],
};

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

beforeEach(() => vi.clearAllMocks());

describe("createUser", () => {
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

    const result = await createUser({}, makeFormData(validUser));
    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty("invitationToken");
    expect(typeof result.data?.invitationToken).toBe("string");
  });

  it("sport_manager cannot create users", async () => {
    vi.spyOn(sessionModule, "getRequiredSession").mockResolvedValue(mockSportManagerSession);

    const result = await createUser({}, makeFormData(validUser));
    expect(result.error).toBe("Forbidden");
  });

  it("returns error when unauthenticated", async () => {
    vi.spyOn(sessionModule, "getRequiredSession").mockRejectedValue(new AuthError(401, "Unauthorized"));

    const result = await createUser({}, makeFormData(validUser));
    expect(result.error).toBe("Unauthorized");
  });
});

describe("getUserStats", () => {
  it("returns user counts grouped by role", async () => {
    vi.spyOn(sessionModule, "getRequiredSession").mockResolvedValue(mockSuperadminSession);
    (prisma.$transaction as ReturnType<typeof vi.fn>).mockResolvedValue([
      2,
      [
        { name: "superadmin", _count: { editors: 1 } },
        { name: "sport_manager", _count: { editors: 1 } },
      ],
    ]);

    const result = await getUserStats();
    expect(result.total).toBe(2);
    expect(result.byRole).toHaveLength(2);
  });
});
