import { AuthError } from "@/lib/session";
import { NextResponse } from "next/server";
import { z } from "zod";

export function apiError(e: unknown): NextResponse {
  if (e instanceof AuthError) {
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
  if (e instanceof z.ZodError) {
    return NextResponse.json({ error: "Invalid request", issues: e.issues }, { status: 400 });
  }
  console.error(e);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}
