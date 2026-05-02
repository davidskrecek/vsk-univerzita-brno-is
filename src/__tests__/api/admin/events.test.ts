import { describe, it, expect, vi, beforeEach } from "vitest";
import { createEvent, updateEvent } from "@/actions/admin/events";
import { mockSuperadminSession, mockSportManagerSession } from "@/__tests__/helpers/session";
import * as sessionModule from "@/lib/session";
import { AuthError } from "@/lib/session";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    event: { create: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { prisma } from "@/lib/prisma";

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

const validEvent = {
  sportId: 1,
  title: "Match day",
  startTime: "2026-05-10T09:00:00.000Z",
  location: "Brno stadium",
  links: [{ url: "https://vskuniverzitabrno.cz", alias: "VSK Brno" }],
};

beforeEach(() => vi.clearAllMocks());

describe("createEvent", () => {
  it("superadmin creates event", async () => {
    vi.spyOn(sessionModule, "getRequiredSession").mockResolvedValue(mockSuperadminSession);
    (prisma.event.create as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 1, ...validEvent });

    const result = await createEvent({}, makeFormData(validEvent));
    expect(result.success).toBe(true);
    expect(result.data?.id).toBe(1);
  });

  it("sport_manager blocked for wrong sport", async () => {
    vi.spyOn(sessionModule, "getRequiredSession").mockResolvedValue(mockSportManagerSession);

    const result = await createEvent({}, makeFormData({ ...validEvent, sportId: 99 }));
    expect(result.error).toBe("Forbidden: sport scope mismatch");
  });

  it("returns error when unauthenticated", async () => {
    vi.spyOn(sessionModule, "getRequiredSession").mockRejectedValue(new AuthError(401, "Unauthorized"));

    const result = await createEvent({}, makeFormData(validEvent));
    expect(result.error).toBe("Unauthorized");
  });
});

describe("updateEvent", () => {
  it("superadmin can cancel an event", async () => {
    vi.spyOn(sessionModule, "getRequiredSession").mockResolvedValue(mockSuperadminSession);
    (prisma.event.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 1, sportId: 1 });
    (prisma.event.update as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 1, isCancelled: true });

    const result = await updateEvent({}, makeFormData({ id: 1, isCancelled: true }));
    expect(result.success).toBe(true);
  });

  it("returns error when event does not exist", async () => {
    vi.spyOn(sessionModule, "getRequiredSession").mockResolvedValue(mockSuperadminSession);
    (prisma.event.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const result = await updateEvent({}, makeFormData({ id: 999, title: "X" }));
    expect(result.error).toBe("Not found");
  });
});
