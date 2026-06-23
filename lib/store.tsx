"use client";

import {
  createContext,
  useContext,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";
import { fakeProvider } from "./data/provider";
import type {
  Contact,
  Conversation,
  ConversationStatus,
  InternalChannel,
  InternalMessage,
  Message,
  Metric,
  SocialPost,
} from "./data/types";

export interface StoreState {
  conversations: Conversation[];
  messages: Message[];
  contacts: Contact[];
  internalChannels: InternalChannel[];
  internalMessages: InternalMessage[];
  socialPosts: SocialPost[];
  metrics: Metric[];
  tsSeq: number;
  idSeq: number;
}

export type StoreAction =
  | { type: "SEND_MESSAGE"; conversationId: string; texto: string; staffId: string }
  | { type: "ASSIGN"; conversationId: string; staffId: string }
  | { type: "SET_STATUS"; conversationId: string; estado: ConversationStatus }
  | { type: "SET_DEPARTMENT"; conversationId: string; departamento: Conversation["departamento"] }
  | { type: "MARK_READ"; conversationId: string }
  | { type: "INCOMING"; conversationId: string; texto: string }
  | { type: "SEND_INTERNAL"; channelId: string; texto: string; staffId: string }
  | { type: "ADD_SOCIAL_POST"; red: SocialPost["red"]; texto: string; fecha: string };

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

// Timestamp determinista por contador, siempre posterior al seed (que termina
// 10:31). Evita Date.now para que los tests sean estables.
export function tsFromSeq(seq: number): string {
  const hour = 11 + Math.floor(seq / 60);
  const min = seq % 60;
  return `2026-06-23T${pad(hour)}:${pad(min)}:00`;
}

export function createInitialState(): StoreState {
  return {
    conversations: fakeProvider.listConversations(),
    messages: fakeProvider
      .listConversations()
      .flatMap((c) => fakeProvider.getMessages(c.id)),
    contacts: fakeProvider.listContacts(),
    internalChannels: fakeProvider.listInternalChannels(),
    internalMessages: fakeProvider
      .listInternalChannels()
      .flatMap((c) => fakeProvider.getInternalMessages(c.id)),
    socialPosts: fakeProvider.listSocialPosts(),
    metrics: fakeProvider.getMetrics(),
    tsSeq: 1,
    idSeq: 1,
  };
}

export function storeReducer(state: StoreState, action: StoreAction): StoreState {
  switch (action.type) {
    case "SEND_MESSAGE": {
      const ts = tsFromSeq(state.tsSeq);
      const msg: Message = {
        id: `nm${state.idSeq}`,
        conversationId: action.conversationId,
        autor: "staff",
        staffId: action.staffId,
        texto: action.texto,
        ts,
      };
      return {
        ...state,
        messages: [...state.messages, msg],
        conversations: state.conversations.map((c) =>
          c.id === action.conversationId
            ? {
                ...c,
                ultimoMensajeTs: ts,
                estado: c.estado === "nuevo" ? "en_progreso" : c.estado,
              }
            : c,
        ),
        tsSeq: state.tsSeq + 1,
        idSeq: state.idSeq + 1,
      };
    }
    case "ASSIGN":
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === action.conversationId ? { ...c, asignadoA: action.staffId } : c,
        ),
      };
    case "SET_STATUS":
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === action.conversationId ? { ...c, estado: action.estado } : c,
        ),
      };
    case "SET_DEPARTMENT":
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === action.conversationId ? { ...c, departamento: action.departamento } : c,
        ),
      };
    case "MARK_READ":
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === action.conversationId ? { ...c, noLeidos: 0 } : c,
        ),
      };
    case "INCOMING": {
      const ts = tsFromSeq(state.tsSeq);
      const msg: Message = {
        id: `nm${state.idSeq}`,
        conversationId: action.conversationId,
        autor: "paciente",
        texto: action.texto,
        ts,
      };
      return {
        ...state,
        messages: [...state.messages, msg],
        conversations: state.conversations.map((c) =>
          c.id === action.conversationId
            ? {
                ...c,
                ultimoMensajeTs: ts,
                noLeidos: c.noLeidos + 1,
                estado: c.estado === "resuelto" ? "en_progreso" : c.estado,
              }
            : c,
        ),
        tsSeq: state.tsSeq + 1,
        idSeq: state.idSeq + 1,
      };
    }
    case "SEND_INTERNAL": {
      const ts = tsFromSeq(state.tsSeq);
      const msg: InternalMessage = {
        id: `nim${state.idSeq}`,
        channelId: action.channelId,
        staffId: action.staffId,
        texto: action.texto,
        ts,
      };
      return {
        ...state,
        internalMessages: [...state.internalMessages, msg],
        tsSeq: state.tsSeq + 1,
        idSeq: state.idSeq + 1,
      };
    }
    case "ADD_SOCIAL_POST": {
      const post: SocialPost = {
        id: `nsp${state.idSeq}`,
        red: action.red,
        estado: "programado",
        texto: action.texto,
        fecha: action.fecha,
      };
      return {
        ...state,
        socialPosts: [post, ...state.socialPosts],
        idSeq: state.idSeq + 1,
      };
    }
    default:
      return state;
  }
}

interface StoreContextValue {
  state: StoreState;
  dispatch: Dispatch<StoreAction>;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(storeReducer, undefined, createInitialState);
  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error("useStore debe usarse dentro de <StoreProvider>");
  }
  return ctx;
}
