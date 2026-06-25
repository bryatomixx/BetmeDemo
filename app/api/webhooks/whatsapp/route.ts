import crypto from "node:crypto";
import { after } from "next/server";
import { addInbound } from "@/lib/wa-store";
import { programarRespuestaIA } from "@/lib/ai-reply";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// La respuesta de la IA corre en `after` (después de responder 200 a Meta). En
// Vercel usa waitUntil; subimos el límite para que quepa el debounce + Claude.
export const maxDuration = 60;

// 1) Verificación: Meta hace un GET al configurar la Callback URL.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new Response(challenge ?? "", { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

function firmaValida(raw: string, firma: string | null, secret: string): boolean {
  if (!firma) return false;
  const esperado = "sha256=" + crypto.createHmac("sha256", secret).update(raw).digest("hex");
  const a = Buffer.from(firma);
  const b = Buffer.from(esperado);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

interface WaTextMessage {
  from: string;
  id: string;
  timestamp?: string;
  type: string;
  text?: { body: string };
}

// 2) Recepción: Meta hace POST con los mensajes entrantes.
export async function POST(req: Request) {
  const raw = await req.text();

  // Valida la firma solo si configuraste el App Secret (en prueba local puede ir vacío).
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (secret) {
    const firma = req.headers.get("x-hub-signature-256");
    if (!firmaValida(raw, firma, secret)) {
      return new Response("Invalid signature", { status: 401 });
    }
  }

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return new Response("Bad Request", { status: 400 });
  }

  const entrantes: Array<{ from: string; wamid: string }> = [];
  try {
    const entries = (payload as { entry?: unknown[] })?.entry ?? [];
    for (const entry of entries) {
      const changes = (entry as { changes?: unknown[] })?.changes ?? [];
      for (const change of changes) {
        const value = (change as { value?: Record<string, unknown> })?.value ?? {};
        const nombrePorWaId = new Map<string, string>();
        for (const c of (value.contacts as Array<{ wa_id?: string; profile?: { name?: string } }>) ?? []) {
          if (c?.wa_id) nombrePorWaId.set(c.wa_id, c?.profile?.name ?? "");
        }
        for (const m of (value.messages as WaTextMessage[]) ?? []) {
          if (m.type !== "text" || !m.text?.body) continue;
          const ts = m.timestamp
            ? new Date(Number(m.timestamp) * 1000).toISOString()
            : new Date().toISOString();
          await addInbound({
            waId: m.id,
            from: m.from,
            nombre: nombrePorWaId.get(m.from) || undefined,
            texto: m.text.body,
            ts,
          });
          entrantes.push({ from: m.from, wamid: m.id });
        }
      }
    }
  } catch {
    // No reventamos: respondemos 200 igual para que Meta no reintente en bucle.
  }

  // Modo IA: respondemos automáticamente DESPUÉS de devolver 200 a Meta.
  if (entrantes.length > 0) {
    after(async () => {
      await Promise.all(
        entrantes.map((t) => programarRespuestaIA({ from: t.from, triggerWamid: t.wamid })),
      );
    });
  }

  return new Response("OK", { status: 200 });
}
