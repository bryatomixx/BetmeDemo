import { NextResponse } from "next/server";
import { generarRespuesta } from "@/lib/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Diagnostico: corre UNA generacion de Claude de forma SINCRONA (sin la espera ni
// el `after` del flujo normal), para aislar si la integracion con Claude funciona
// en el servidor. Si responde, el problema del Modo IA es el timeout de la funcion.
export async function POST() {
  try {
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
