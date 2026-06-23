"use client";

import { useStore } from "@/lib/store";
import { useLive } from "@/lib/live-context";
import { useLiveEngine } from "@/lib/data/live-engine";

// Punto único donde corre el motor en vivo, dentro de los providers.
export function LiveMount() {
  const { dispatch } = useStore();
  const { enabled } = useLive();
  useLiveEngine(dispatch, enabled);
  return null;
}
