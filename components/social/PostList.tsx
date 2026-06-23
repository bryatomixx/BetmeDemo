import { CalendarClock, CheckCircle2, FileText } from "lucide-react";
import { ChannelBadge } from "@/components/ui/ChannelBadge";
import type { SocialPost } from "@/lib/data/types";

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function fechaPost(iso: string): string {
  const fecha = iso.slice(0, 10);
  const [, mes, dia] = fecha.split("-");
  const hhmm = iso.slice(11, 16);
  return `${Number(dia)} ${MESES[Number(mes) - 1]} · ${hhmm}`;
}

const GRUPOS = [
  { estado: "programado", titulo: "Programadas", Icon: CalendarClock, tone: "text-[#0067f8]" },
  { estado: "publicado", titulo: "Publicadas", Icon: CheckCircle2, tone: "text-[#2f9e2f]" },
  { estado: "borrador", titulo: "Borradores", Icon: FileText, tone: "text-[#94a3b4]" },
] as const;

export function PostList({ posts }: { posts: SocialPost[] }) {
  return (
    <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
      {GRUPOS.map(({ estado, titulo, Icon, tone }) => {
        const grupo = posts.filter((p) => p.estado === estado);
        if (grupo.length === 0) return null;
        return (
          <section key={estado}>
            <h2 className={`mb-2.5 flex items-center gap-1.5 text-[12.5px] font-bold uppercase tracking-wide ${tone}`}>
              <Icon size={15} />
              {titulo}
              <span className="text-[#94a3b4]">({grupo.length})</span>
            </h2>
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {grupo.map((p) => (
                <article
                  key={p.id}
                  className="rounded-xl border border-line bg-card p-3.5 shadow-sm"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <ChannelBadge channel={p.red} showLabel />
                    <span className="text-[11.5px] text-[#94a3b4]">{fechaPost(p.fecha)}</span>
                  </div>
                  <p className="text-[13.5px] leading-relaxed text-[#33425a]">{p.texto}</p>
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
