// Persistencia de mensajes entrantes de WhatsApp.
// Si hay Supabase configurado, guarda/lee de la tabla `wa_messages` (persiste,
// sobrevive reinicios, sirve desplegado). Si no, cae a un store EN MEMORIA
// (prueba local, se pierde al reiniciar). El resto del flujo no cambia.
import { getSupabase } from "./supabase";

export interface WaInbound {
  seq: number; // cursor monotónico (id de la fila, o contador en memoria)
  waId: string; // id del mensaje en WhatsApp (dedup)
  from: string; // número del paciente (wa_id)
  nombre?: string;
  texto: string;
  ts: string; // ISO 8601
}

// Fallback en memoria.
const mem: WaInbound[] = [];
let memSeq = 0;
const MAX = 500;

export async function addInbound(m: Omit<WaInbound, "seq">): Promise<void> {
  const sb = getSupabase();
  if (sb) {
    const { error } = await sb.from("wa_messages").upsert(
      {
        wa_id: m.waId,
        wa_from: m.from,
        nombre: m.nombre ?? null,
        texto: m.texto,
        ts: m.ts,
      },
      { onConflict: "wa_id", ignoreDuplicates: true },
    );
    if (error) console.error("Supabase insert WA:", error.message);
    return;
  }
  if (mem.some((x) => x.waId === m.waId)) return; // dedup
  mem.push({ ...m, seq: ++memSeq });
  if (mem.length > MAX) mem.splice(0, mem.length - MAX);
}

// Devuelve los mensajes con cursor (seq/id) mayor al del cliente.
export async function getSince(after: number): Promise<WaInbound[]> {
  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb
      .from("wa_messages")
      .select("id, wa_id, wa_from, nombre, texto, ts")
      .gt("id", after)
      .order("id", { ascending: true })
      .limit(100);
    if (error) {
      console.error("Supabase select WA:", error.message);
      return [];
    }
    return (data ?? []).map((r) => ({
      seq: Number(r.id),
      waId: r.wa_id as string,
      from: r.wa_from as string,
      nombre: (r.nombre as string | null) ?? undefined,
      texto: r.texto as string,
      ts: r.ts as string,
    }));
  }
  return mem.filter((m) => m.seq > after);
}
