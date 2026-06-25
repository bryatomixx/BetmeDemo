import { NextResponse } from "next/server";
import { addOutbound } from "@/lib/wa-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Versión del Graph API. Si Meta la depreca, súbela aquí o vía env.
const VERSION = process.env.WHATSAPP_GRAPH_VERSION || "v21.0";
const GRAPH = `https://graph.facebook.com/${VERSION}`;

// Envía un mensaje de texto de WhatsApp por la Cloud API.
// Body esperado: { to: "<número wa_id>", text: "<mensaje>" }.
export async function POST(req: Request) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneId) {
    return NextResponse.json(
      { ok: false, error: "Faltan WHATSAPP_ACCESS_TOKEN o WHATSAPP_PHONE_NUMBER_ID en .env.local" },
      { status: 500 },
    );
  }

  let body: { to?: string; text?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }
  const to = body.to?.trim();
  const text = body.text?.trim();
  if (!to || !text) {
    return NextResponse.json({ ok: false, error: "Faltan 'to' o 'text'" }, { status: 400 });
  }

  const res = await fetch(`${GRAPH}/${phoneId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "text",
      text: { preview_url: false, body: text },
    }),
  });

  const data: unknown = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error =
      (data as { error?: { message?: string } })?.error?.message ?? `Graph respondió ${res.status}`;
    return NextResponse.json({ ok: false, error, raw: data }, { status: 502 });
  }

  const id = (data as { messages?: Array<{ id?: string }> })?.messages?.[0]?.id;

  // Persistimos el mensaje saliente para que la conversación sobreviva al recargar.
  if (id) {
    await addOutbound({ waId: id, to, texto: text, ts: new Date().toISOString() });
  }

  return NextResponse.json({ ok: true, id });
}
