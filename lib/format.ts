import { departments, staff } from "./data/seed";
import type { DepartmentId } from "./data/types";

const HOY = "2026-06-23";
const AYER = "2026-06-22";

const MESES = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

// "2026-06-23T09:42:00" -> "9:42"
export function horaDe(ts: string): string {
  const hhmm = ts.slice(11, 16);
  const [h, m] = hhmm.split(":");
  return `${Number(h)}:${m}`;
}

// Etiqueta corta y relativa para listas: "Hoy", "Ayer" o "21 jun".
export function diaRelativo(ts: string): string {
  const fecha = ts.slice(0, 10);
  if (fecha === HOY) return horaDe(ts);
  if (fecha === AYER) return "Ayer";
  const [, mes, dia] = fecha.split("-");
  return `${Number(dia)} ${MESES[Number(mes) - 1]}`;
}

const staffById = new Map(staff.map((s) => [s.id, s]));
const deptById = new Map(departments.map((d) => [d.id, d]));

export function nombreStaff(id?: string): string {
  if (!id) return "Sin asignar";
  return staffById.get(id)?.nombre ?? "Desconocido";
}

export function inicialesStaff(id?: string): string {
  if (!id) return "?";
  return staffById.get(id)?.iniciales ?? "?";
}

export function depto(id: DepartmentId) {
  return deptById.get(id)!;
}

// Metadatos de un miembro del staff para chat interno (nombre, iniciales, color).
export function staffMeta(id: string) {
  const s = staffById.get(id);
  if (!s) return { nombre: "Desconocido", iniciales: "?", color: "#64748b" };
  return {
    nombre: s.nombre,
    iniciales: s.iniciales,
    color: deptById.get(s.departamento)?.color ?? "#64748b",
  };
}
