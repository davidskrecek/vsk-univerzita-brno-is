"use server";

import { SignJWT } from "jose";
import { prisma } from "@/lib/prisma";
import { sendConfirmationEmail } from "@/lib/mailer";

export type OrderFormData = {
  // Replace with your actual form fields, e.g.:
  // name: string;
  // email: string;
  email: string;
  [key: string]: unknown;
};

export async function submitOrder(formData: OrderFormData): Promise<void> {
  const orderId = crypto.randomUUID();

  // Persist the order lock so we can track confirmation state
  await prisma.orderLock.create({
    data: {
      id: orderId,
      confirmed: false,
    },
  });

  // Sign a JWT containing the orderId and the submitted form data
  const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
  const token = await new SignJWT({ orderId, formData })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(secret);

  const confirmationLink = `${process.env.NEXT_PUBLIC_APP_URL}/api/confirm?token=${token}`;

  // Send confirmation email to the user
  await sendConfirmationEmail(formData.email, confirmationLink);
}
