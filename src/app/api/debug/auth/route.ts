import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Diagnostic auth (dev uniquement) — GET /api/debug/auth */
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const state = await auth();

  return NextResponse.json({
    userId: state.userId ?? null,
    sessionId: state.sessionId ?? null,
    isAuthenticated: state.isAuthenticated,
    message: state.userId
      ? "Serveur : session valide"
      : "Serveur : pas de session (si le client croit être connecté → session fantôme Clerk)",
  });
}
