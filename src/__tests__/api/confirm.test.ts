import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/confirm/route";

vi.mock("jose", () => ({
  jwtVerify: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    orderLock: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/lib/mailer", () => ({
  sendChairmanNotification: vi.fn(),
}));

import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";
import { sendChairmanNotification } from "@/lib/mailer";

const makeRequest = (token?: string) =>
  new NextRequest(`http://localhost:3000/api/confirm${token ? `?token=${token}` : ""}`);

beforeEach(() => {
  vi.clearAllMocks();
  process.env.JWT_SECRET = "test-secret";
});

describe("GET /api/confirm", () => {
  it("redirects to /expired when token is missing", async () => {
    const res = await GET(makeRequest());

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:3000/expired");
  });

  it("redirects to /expired for invalid token", async () => {
    (jwtVerify as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("invalid token"));

    const res = await GET(makeRequest("bad-token"));

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:3000/expired");
  });

  it("redirects to /error when JWT secret is missing", async () => {
    delete process.env.JWT_SECRET;

    const res = await GET(makeRequest("token"));

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:3000/error");
  });

  it("redirects to /error when order lock does not exist", async () => {
    (jwtVerify as ReturnType<typeof vi.fn>).mockResolvedValue({ payload: { orderId: "lock-1", formData: {} } });
    (prisma.orderLock.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const res = await GET(makeRequest("ok-token"));

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:3000/error");
  });

  it("redirects to /already-confirmed when lock is already confirmed", async () => {
    (jwtVerify as ReturnType<typeof vi.fn>).mockResolvedValue({ payload: { orderId: "lock-1", formData: {} } });
    (prisma.orderLock.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "lock-1", confirmed: true });

    const res = await GET(makeRequest("ok-token"));

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:3000/already-confirmed");
  });

  it("confirms lock, sends notification and redirects to /success", async () => {
    (jwtVerify as ReturnType<typeof vi.fn>).mockResolvedValue({
      payload: { orderId: "lock-1", formData: { email: "user@example.com", details: "abc" } },
    });
    (prisma.orderLock.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "lock-1", confirmed: false });
    (prisma.orderLock.update as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "lock-1", confirmed: true });

    const res = await GET(makeRequest("ok-token"));

    expect(prisma.orderLock.update).toHaveBeenCalledWith({
      where: { id: "lock-1" },
      data: { confirmed: true },
    });
    expect(sendChairmanNotification).toHaveBeenCalledWith({
      orderId: "lock-1",
      email: "user@example.com",
      details: "abc",
    });
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:3000/success");
  });

  it("wraps non-object formData under formData key", async () => {
    (jwtVerify as ReturnType<typeof vi.fn>).mockResolvedValue({
      payload: { orderId: "lock-1", formData: "unexpected" },
    });
    (prisma.orderLock.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "lock-1", confirmed: false });
    (prisma.orderLock.update as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "lock-1", confirmed: true });

    await GET(makeRequest("ok-token"));

    expect(sendChairmanNotification).toHaveBeenCalledWith({
      orderId: "lock-1",
      formData: "unexpected",
    });
  });
});
