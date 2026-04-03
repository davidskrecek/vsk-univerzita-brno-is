import { NextApiRequest } from "next";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export type AppSession = {
  user: {
    email: string;
    name?: string | null;
    personnelId: number;
    role: string;
    managedSportId: number | null;
  };
};

export async function getRequiredSession(): Promise<AppSession> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new AuthError(401, "Unauthorized");
  }
  return session as AppSession;
}

export class AuthError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}
