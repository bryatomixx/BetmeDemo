import { NextResponse, after } from "next/server";
import { addInbound } from "@/lib/wa-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Diagnostico: confirma si `after()` se ejecuta en este Vercel. Programa una
// escritura (con una espera de 2s) DESPUES de responder. Si luego aparece una
// fila con from "AFTERTEST", `after` si corre.
export async function GET() {
  const marker = `wamid.AFTER_${Date.now()}`;
  after(async () => {
    try {
      await new Promise((r) => setTimeout(r, 2000));
      await addInbound({ waId: marker, from: "AFTERTEST", texto: "after ejecuto ok", ts: new Date().toISOString() });
    } catch {
      // silencioso
    }
  });
  return NextResponse.json({ scheduled: marker });
}
