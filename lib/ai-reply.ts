// Respuesta automática de la IA con "debounce": espera un silencio antes de
// contestar, para que una ráfaga de mensajes del paciente se responda UNA vez.
import { addOutbound, getSince } from "./wa-store";
import { getAiEnabled, isPaused } from "./ai-store";
import { upsertContacto } from "./contacts-store";
import { generarRespuesta, type TurnoIA } from "./ai";
import { enviarTextoWa, mostrarEscribiendo, enviarReaccion } from "./wa-send";

// Cuánto silencio esperar tras el último mensaje antes de responder.
// OJO en Vercel: el trabajo de `after` está limitado por maxDuration (10s en el
// plan Hobby). 5s + la llamada a Claude debe caber ahí; en Pro hay más margen.
const DEBOUNCE_MS = Number(process.env.AI_DEBOUNCE_MS) || 5000;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function programarRespuestaIA(opts: {
  from: string;
  triggerWamid: string;
}): Promise<void> {
  try {
    if (!(await getAiEnabled())) return;
    if (await isPaused(opts.from)) return;

    await sleep(DEBOUNCE_MS);

    // ¿Sigo siendo el último mensaje de esta conversación? Si llegó uno más nuevo
    // (otra parte de la ráfaga) o ya hay respuesta, me retiro: otro handler responde.
    const conv = (await getSince(0))
      .filter((m) => m.from === opts.from)
      .sort((a, b) => a.seq - b.seq);
    const ultimo = conv.at(-1);
    if (!ultimo || ultimo.waId !== opts.triggerWamid || ultimo.direccion !== "in") return;

    // Reconfirmar estado tras la espera (pudo apagarse o tomarlo un humano).
    if (!(await getAiEnabled())) return;
    if (await isPaused(opts.from)) return;

    const historial: TurnoIA[] = conv.map((m) => ({
      autor: m.direccion === "out" ? "staff" : "paciente",
      texto: m.texto,
    }));
    if (historial.length === 0) return;

    // "escribiendo..." mientras Claude redacta.
    await mostrarEscribiendo(opts.triggerWamid);

    const respuesta = await generarRespuesta(historial, {
      onGuardarContacto: (d) =>
        upsertContacto({ from: opts.from, nombre: d.nombre, correo: d.correo }),
      onReaccionar: (emoji) => enviarReaccion(opts.from, opts.triggerWamid, emoji),
    });
    const env = await enviarTextoWa(opts.from, respuesta);
    if (env.ok && env.id) {
      await addOutbound({ waId: env.id, to: opts.from, texto: respuesta, ts: new Date().toISOString() });
    } else {
      console.error("IA: falló el envío:", env.error);
    }
  } catch (e) {
    console.error("IA error:", e);
  }
}
