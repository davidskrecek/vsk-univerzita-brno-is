import { vi } from "vitest";

export const prisma = {
  sport: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    upsert: vi.fn(),
  },
  post: {
    count: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  event: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  personnel: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  editor: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
  },
  editorRole: {
    findMany: vi.fn(),
  },
  partnerOrder: {
    create: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
  },
  trainer: {
    create: vi.fn(),
  },
  official: {
    create: vi.fn(),
  },
  accountInvitation: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  $transaction: vi.fn(),
};
