"use client";

import { useState, type KeyboardEvent } from "react";
import { SendHorizonal } from "lucide-react";

export function Composer({
  onSend,
  placeholder = "Escribe una respuesta...",
}: {
  onSend: (texto: string) => void;
  placeholder?: string;
}) {
  const [texto, setTexto] = useState("");

  function enviar() {
    const limpio = texto.trim();
    if (!limpio) return;
    onSend(limpio);
    setTexto("");
  }

  function onKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviar();
    }
  }

  return (
    <div className="flex items-end gap-2 border-t border-line bg-card px-4 py-3">
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onKeyDown={onKey}
        rows={1}
        placeholder={placeholder}
        className="max-h-32 min-h-[42px] flex-1 resize-none rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-[#0f1b2d] outline-none transition placeholder:text-[#94a3b4] focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/15"
      />
      <button
        type="button"
        onClick={enviar}
        disabled={!texto.trim()}
        aria-label="Enviar"
        className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl bg-brand text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
      >
        <SendHorizonal size={18} />
      </button>
    </div>
  );
}
