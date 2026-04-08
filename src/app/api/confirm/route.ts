import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendChairmanNotification } from "@/lib/mailer";

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
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);
    orderId = payload.orderId as string;
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
  await sendChairmanNotification({ orderId, ...formData as object });

  return NextResponse.redirect(new URL("/success", request.url));
}
