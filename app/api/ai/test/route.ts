import { NextResponse } from "next/server";
import { generarRespuesta, type TurnoIA } from "@/lib/ai";
import { getSince, addOutbound } from "@/lib/wa-store";
import { enviarTextoWa } from "@/lib/wa-send";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Diagnostico. Sin body: corre UNA generacion de Claude sincrona. Con { from }:
// corre el flujo de respuesta COMPLETO (historial + Claude + envio + persistir)
// de forma SINCRONA (sin `after` ni espera), para aislar si el problema del Modo
// IA es el `after()`/timeout o el flujo en si.
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { from?: string };
  const from = typeof body.from === "string" ? body.from.trim() : "";

  try {
    if (from) {
      const conv = (await getSince(0))
        .filter((m) => m.from === from)
        .sort((a, b) => a.seq - b.seq);
      const historial: TurnoIA[] = conv.map((m) => ({
        autor: m.direccion === "out" ? "staff" : "paciente",
        texto: m.texto,
      }));
      const respuesta = await generarRespuesta(historial);
      const env = await enviarTextoWa(from, respuesta);
      let persisted = false;
      if (env.ok && env.id) {
        await addOutbound({ waId: env.id, to: from, texto: respuesta, ts: new Date().toISOString() });
        persisted = true;
      }
      return NextResponse.json({ ok: env.ok, convLen: conv.length, respuesta, send: env, persisted });
    }

    const texto = await generarRespuesta([
      { autor: "paciente", texto: "Hola, esto es una prueba. Saluda en una frase." },
    ]);
    return NextResponse.json({ ok: true, texto });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
