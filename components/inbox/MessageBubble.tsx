import { cn } from "@/lib/cn";
import { horaDe, nombreStaff } from "@/lib/format";
import type { Message } from "@/lib/data/types";

export function MessageBubble({ message, isNew }: { message: Message; isNew?: boolean }) {
  const esStaff = message.autor === "staff";
  return (
    <div className={cn("flex flex-col", esStaff ? "items-end" : "items-start", isNew && "ccg-pop")}>
      <div
        className={cn(
          "max-w-[78%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow-sm",
          esStaff
            ? "rounded-br-sm bg-brand text-white"
            : "rounded-bl-sm bg-white text-[#0f1b2d] ring-1 ring-line",
        )}
      >
        {message.texto}
      </div>
      <span className="mt-1 px-1 text-[10.5px] text-[#94a3b4]">
        {esStaff && message.staffId ? `${nombreStaff(message.staffId)} · ` : ""}
        {horaDe(message.ts)}
      </span>
    </div>
  );
}
