import { NextResponse } from "next/server";
import { isPaused, pauseConvo, unpauseConvo } from "@/lib/ai-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Estado de la IA para UNA conversacion (la lee el toggle del hilo).
// GET ?from=<wa_from> -> { paused: boolean }  (paused = IA apagada para ese chat)
export async function GET(req: Request) {
  const from = new URL(req.url).searchParams.get("from")?.trim() || "";
  if (!from) return NextResponse.json({ paused: false });
  return NextResponse.json({ paused: await isPaused(from) });
}

// POST { from, paused } -> pausa o reactiva la IA para esa conversacion.
export async function POST(req: Request) {
  let body: { from?: string; paused?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON invalido" }, { status: 400 });
  }
  const from = body.from?.trim();
  if (!from) {
    return NextResponse.json({ ok: false, error: "Falta 'from'" }, { status: 400 });
  }
  const paused = Boolean(body.paused);
  if (paused) await pauseConvo(from);
  else await unpauseConvo(from);
  return NextResponse.json({ ok: true, paused });
}
