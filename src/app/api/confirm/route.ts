import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendChairmanNotification } from "@/lib/mailer";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = request.nextUrl;
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/expired", request.url));
  }

  // --- 1. Verify the JWT ---
  let orderId: string;
  let formData: unknown;

  try {
    if (!process.env.JWT_SECRET) {
      return NextResponse.redirect(new URL("/error", request.url));
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    if (typeof payload.orderId !== "string" || payload.orderId.length === 0) {
      return NextResponse.redirect(new URL("/expired", request.url));
    }

    orderId = payload.orderId;
    formData = payload.formData;
  } catch {
    // Covers expired tokens, invalid signatures, malformed JWTs, etc.
    return NextResponse.redirect(new URL("/expired", request.url));
  }

  // --- 2. Fetch the OrderLock ---
  const orderLock = await prisma.orderLock.findUnique({
    where: { id: orderId },
  });

  if (!orderLock) {
    return NextResponse.redirect(new URL("/error", request.url));
  }

  // --- 3. Guard against double-confirmation ---
  if (orderLock.confirmed) {
    return NextResponse.redirect(new URL("/already-confirmed", request.url));
  }

  // --- 4. Mark the order as confirmed ---
  await prisma.orderLock.update({
    where: { id: orderId },
    data: { confirmed: true },
  });

  // --- 5. Notify the chairman ---
  const normalizedFormData = isRecord(formData) ? formData : { formData };
  await sendChairmanNotification({ orderId, ...normalizedFormData });

  return NextResponse.redirect(new URL("/success", request.url));
}
