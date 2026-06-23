"use client";

import { useEffect, useRef } from "react";
import { Check, UserPlus } from "lucide-react";
import { cn } from "@/lib/cn";
import { depto } from "@/lib/format";
import { Avatar, inicialesDe } from "@/components/ui/Avatar";
import { ChannelBadge } from "@/components/ui/ChannelBadge";
import { StatusPill } from "@/components/ui/StatusPill";
import { MessageBubble } from "./MessageBubble";
import { Composer } from "./Composer";
import type { Contact, Conversation, Message } from "@/lib/data/types";

export function Thread({
  conversation,
  contact,
  messages,
  esMia,
  onSend,
  onAsignarme,
  onResolver,
}: {
  conversation: Conversation;
  contact: Contact;
  messages: Message[];
  esMia: boolean;
  onSend: (texto: string) => void;
  onAsignarme: () => void;
  onResolver: () => void;
}) {
  const finRef = useRef<HTMLDivElement>(null);
  const d = depto(conversation.departamento);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  return (
    <div className="flex h-full min-w-0 flex-col bg-surface">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-line bg-card px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar iniciales={inicialesDe(contact.nombre)} size={40} color={d.color} />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-[#0f1b2d]">{contact.nombre}</p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <ChannelBadge channel={conversation.canal} showLabel />
              <span className="text-[11px] text-[#94a3b4]">·</span>
              <span className="text-[11px] font-medium" style={{ color: d.color }}>
                {d.nombre}
              </span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <StatusPill estado={conversation.estado} />
          {!esMia && (
            <button
              type="button"
              onClick={onAsignarme}
              className="flex items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 py-1.5 text-[12.5px] font-semibold text-[#5b6b80] transition hover:border-brand hover:text-brand"
            >
              <UserPlus size={15} />
              Asignarme
            </button>
          )}
          <button
            type="button"
            onClick={onResolver}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12.5px] font-semibold transition",
              conversation.estado === "resuelto"
                ? "bg-emerald-50 text-[#2f9e2f]"
                : "bg-brand text-white hover:bg-brand-dark",
            )}
          >
            <Check size={15} />
            {conversation.estado === "resuelto" ? "Resuelta" : "Resolver"}
          </button>
        </div>
      </div>

      {/* Mensajes */}
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((m, i) => (
          <MessageBubble key={m.id} message={m} isNew={i === messages.length - 1} />
        ))}
        <div ref={finRef} />
      </div>

      <Composer onSend={onSend} />
    </div>
  );
}
