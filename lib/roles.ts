"use client";

import { useEffect, useState } from "react";
import type { RoleId } from "./data/types";

export type ModuleId = "bandeja" | "interno" | "redes" | "dashboard";

export interface RoleDef {
  id: RoleId;
  nombre: string;
  ve: ModuleId[];
}

export const ROLES: Record<RoleId, RoleDef> = {
  recepcion: { id: "recepcion", nombre: "Recepción", ve: ["bandeja", "interno"] },
  medico: { id: "medico", nombre: "Médico", ve: ["bandeja", "interno"] },
  jefe: { id: "jefe", nombre: "Jefe de departamento", ve: ["bandeja", "interno", "dashboard"] },
  admin: { id: "admin", nombre: "Admin / Marketing", ve: ["bandeja", "interno", "redes", "dashboard"] },
};

const STORAGE_KEY = "ccg.rol";
const DEFAULT_ROLE: RoleId = "admin"; // el demo abre mostrando todo

export function useRole() {
  const [rol, setRolState] = useState<RoleId>(DEFAULT_ROLE);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY) as RoleId | null;
    if (saved && saved in ROLES) {
      setRolState(saved);
    }
  }, []);

  function setRol(next: RoleId) {
    setRolState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }

  return { rol, setRol, def: ROLES[rol] };
}
