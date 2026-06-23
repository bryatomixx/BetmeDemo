import { cn } from "@/lib/cn";
import type { ConversationStatus } from "@/lib/data/types";

const MAP: Record<ConversationStatus, { label: string; className: string }> = {
  nuevo: { label: "Nuevo", className: "bg-blue-50 text-[#0067f8] ring-1 ring-[#0067f8]/20" },
  en_progreso: { label: "En progreso", className: "bg-amber-50 text-amber-700 ring-1 ring-amber-300/50" },
  resuelto: { label: "Resuelto", className: "bg-emerald-50 text-[#2f9e2f] ring-1 ring-[#4ac12f]/30" },
};

export function StatusPill({
  estado,
  className,
}: {
  estado: ConversationStatus;
  className?: string;
}) {
  const { label, className: tone } = MAP[estado];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
        tone,
        className,
      )}
    >
      {label}
    </span>
  );
}
