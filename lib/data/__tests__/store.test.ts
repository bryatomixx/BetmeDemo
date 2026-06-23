import { describe, expect, it } from "vitest";
import { createInitialState, storeReducer, type StoreState } from "../../store";

function freshState(): StoreState {
  return createInitialState();
}

function conv(state: StoreState, id: string) {
  return state.conversations.find((c) => c.id === id)!;
}

function msgs(state: StoreState, id: string) {
  return state.messages.filter((m) => m.conversationId === id);
}

describe("storeReducer", () => {
  it("SEND_MESSAGE agrega un mensaje de staff y pasa 'nuevo' a 'en_progreso'", () => {
    const before = freshState();
    expect(conv(before, "v2").estado).toBe("nuevo");
    const after = storeReducer(before, {
      type: "SEND_MESSAGE",
      conversationId: "v2",
      texto: "Con gusto le ayudo.",
      staffId: "me",
    });
    const added = msgs(after, "v2").at(-1)!;
    expect(added.autor).toBe("staff");
    expect(added.texto).toBe("Con gusto le ayudo.");
    expect(conv(after, "v2").estado).toBe("en_progreso");
    expect(conv(after, "v2").ultimoMensajeTs).toBe(added.ts);
  });

  it("ASSIGN fija el responsable", () => {
    const after = storeReducer(freshState(), {
      type: "ASSIGN",
      conversationId: "v2",
      staffId: "s2",
    });
    expect(conv(after, "v2").asignadoA).toBe("s2");
  });

  it("SET_STATUS cambia el estado", () => {
    const after = storeReducer(freshState(), {
      type: "SET_STATUS",
      conversationId: "v1",
      estado: "resuelto",
    });
    expect(conv(after, "v1").estado).toBe("resuelto");
  });

  it("MARK_READ pone los no leídos en cero", () => {
    const before = freshState();
    expect(conv(before, "v2").noLeidos).toBeGreaterThan(0);
    const after = storeReducer(before, { type: "MARK_READ", conversationId: "v2" });
    expect(conv(after, "v2").noLeidos).toBe(0);
  });

  it("INCOMING agrega un mensaje de paciente e incrementa no leídos", () => {
    const before = freshState();
    const prev = conv(before, "v1").noLeidos;
    const after = storeReducer(before, {
      type: "INCOMING",
      conversationId: "v1",
      texto: "Una última pregunta doctor.",
    });
    const added = msgs(after, "v1").at(-1)!;
    expect(added.autor).toBe("paciente");
    expect(conv(after, "v1").noLeidos).toBe(prev + 1);
  });

  it("SEND_INTERNAL agrega un mensaje al canal interno", () => {
    const before = freshState();
    const prev = before.internalMessages.filter((m) => m.channelId === "ic1").length;
    const after = storeReducer(before, {
      type: "SEND_INTERNAL",
      channelId: "ic1",
      texto: "Equipo, reunión a las 4.",
      staffId: "me",
    });
    expect(after.internalMessages.filter((m) => m.channelId === "ic1").length).toBe(prev + 1);
  });

  it("ADD_SOCIAL_POST agrega una publicación programada al inicio", () => {
    const after = storeReducer(freshState(), {
      type: "ADD_SOCIAL_POST",
      red: "instagram",
      texto: "Nueva campaña de control prenatal.",
      fecha: "2026-06-26T09:00:00",
    });
    expect(after.socialPosts[0].estado).toBe("programado");
    expect(after.socialPosts[0].texto).toBe("Nueva campaña de control prenatal.");
  });
});
