"use client";

import { useEffect, useRef } from "react";
import type { Dispatch } from "react";
import type { StoreAction } from "./store";

interface WaInboundDTO {
  seq: number;
  waId: string;
  from: string;
  nombre?: string;
  texto: string;
  ts: string;
  direccion?: "in" | "out";
}

// Puente: sondea el webhook server-side y mete los mensajes reales de WhatsApp
// en el store (como conversaciones nuevas o existentes). Corre siempre, no
// depende del toggle "en vivo" del demo.
export function useWhatsappBridge(dispatch: Dispatch<StoreAction>) {
  const cursor = useRef(0);

  useEffect(() => {
    let activo = true;

    async function sondear() {
      try {
        const r = await fetch(`/api/whatsapp/inbox?after=${cursor.current}`);
        if (!r.ok || !activo) return;
        const data = (await r.json()) as { mensajes: WaInboundDTO[] };
        for (const m of data.mensajes) {
          dispatch({
            type: "WHATSAPP_INCOMING",
            waId: m.waId,
            from: m.from,
            nombre: m.nombre,
            texto: m.texto,
            ts: m.ts,
            direccion: m.direccion,
          });
          if (m.seq > cursor.current) cursor.current = m.seq;
        }
      } catch {
        // silencioso: reintenta en el próximo tick
      }
    }

    const handle = window.setInterval(sondear, 4000);
    sondear();
    return () => {
      activo = false;
      window.clearInterval(handle);
    };
  }, [dispatch]);
}
