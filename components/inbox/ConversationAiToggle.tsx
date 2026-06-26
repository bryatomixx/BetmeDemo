"use client";

import { useEffect, useState } from "react";
import { Bot } from "lucide-react";
import { cn } from "@/lib/cn";

// Toggle de la IA para UNA conversacion. Si esta "activa", la IA responde ese
// chat; si esta "en pausa", lo lleva un humano. Se pausa solo cuando alguien
// responde manual; este boton permite reactivarla.
export function ConversationAiToggle({
  from,
  visible,
  refreshKey = 0,
}: {
  from?: string;
  visible: boolean;
  refreshKey?: number;
}) {
  const [paused, setPaused] = useState<boolean | null>(null);

  useEffect(() => {
    if (!visible || !from) {
      setPaused(null);
      return;
    }
    let activo = true;
    fetch(`/api/ai/conversacion?from=${encodeURIComponent(from)}`)
      .then((r) => r.json())
      .then((d) => {
        if (activo) setPaused(Boolean(d.paused));
      })
      .catch(() => {
        if (activo) setPaused(false);
      });
    return () => {
      activo = false;
    };
  }, [from, visible, refreshKey]);

  if (!visible || !from || paused === null) return null;
  const activa = !paused;

  async function toggle() {
    const nuevoPaused = activa; // activa -> pausar; pausada -> reactivar
    setPaused(nuevoPaused);
    try {
      await fetch("/api/ai/conversacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from, paused: nuevoPaused }),
      });
    } catch {
      setPaused(!nuevoPaused);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={activa}
      title={
        activa
          ? "La IA responde este chat. Toca para tomarlo tú."
          : "Tú llevas este chat. Toca para reactivar la IA."
      }
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px] font-semibold transition",
        activa
          ? "border-emerald-200 bg-emerald-50 text-[#2f9e2f]"
          : "border-line bg-white text-[#5b6b80] hover:border-[#cdd5df]",
      )}
    >
      <Bot size={13} />
      <span className="hidden md:inline">IA {activa ? "activa" : "en pausa"}</span>
      <span
        className={cn(
          "relative inline-flex h-3.5 w-6 items-center rounded-full transition",
          activa ? "bg-[#2f9e2f]" : "bg-[#cdd5df]",
        )}
      >
        <span
          className={cn(
            "inline-block h-2.5 w-2.5 rounded-full bg-white shadow transition",
            activa ? "translate-x-3" : "translate-x-0.5",
          )}
        />
      </span>
    </button>
  );
}
