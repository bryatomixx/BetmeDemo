import { HeartPulse } from "lucide-react";

// Wordmark propio (no reutilizamos el logo original del hospital por derechos).
export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white shadow-sm">
        <HeartPulse size={20} strokeWidth={2.4} />
      </span>
      {!compact && (
        <div className="leading-tight">
          <p className="text-[15px] font-extrabold tracking-tight text-[#0f1b2d]">
            Centro Ginecológico
          </p>
          <p className="text-[11px] font-medium text-brand">Somos parte de tu vida</p>
        </div>
      )}
    </div>
  );
}
