// Estado del Modo IA, respaldado en Supabase para que el webhook (always-on,
// server-side) lo lea. Si no hay Supabase, cae a memoria (solo sirve en local).
import { getSupabase } from "./supabase";

let memEnabled = false;
const memPaused = new Set<string>();

// Interruptor global on/off.
export async function getAiEnabled(): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return memEnabled;
  const { data, error } = await sb.from("ai_config").select("enabled").eq("id", 1).maybeSingle();
  if (error) {
    console.error("ai_config select:", error.message);
    return false;
  }
  return Boolean(data?.enabled);
}

export async function setAiEnabled(enabled: boolean): Promise<void> {
  const sb = getSupabase();
  if (!sb) {
    memEnabled = enabled;
    return;
  }
  const { error } = await sb
    .from("ai_config")
    .upsert({ id: 1, enabled, updated_at: new Date().toISOString() }, { onConflict: "id" });
  if (error) console.error("ai_config upsert:", error.message);
}

// Apagado por conversación: cuando un humano responde, la IA se retira de ese chat.
export async function isPaused(from: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return memPaused.has(from);
  const { data, error } = await sb
    .from("ai_paused")
    .select("wa_from")
    .eq("wa_from", from)
    .maybeSingle();
  if (error) {
    console.error("ai_paused select:", error.message);
    return false;
  }
  return Boolean(data);
}

export async function pauseConvo(from: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) {
    memPaused.add(from);
    return;
  }
  const { error } = await sb
    .from("ai_paused")
    .upsert({ wa_from: from }, { onConflict: "wa_from", ignoreDuplicates: true });
  if (error) console.error("ai_paused upsert:", error.message);
}

// Reactiva la IA para una conversacion (quita la pausa).
export async function unpauseConvo(from: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) {
    memPaused.delete(from);
    return;
  }
  const { error } = await sb.from("ai_paused").delete().eq("wa_from", from);
  if (error) console.error("ai_paused delete:", error.message);
}
