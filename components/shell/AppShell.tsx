"use client";

import type { ReactNode } from "react";
import { StoreProvider } from "@/lib/store";
import { LiveProvider } from "@/lib/live-context";
import { Sidebar } from "./Sidebar";
import { LiveMount } from "./LiveMount";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      <LiveProvider>
        <LiveMount />
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex min-w-0 flex-1 flex-col overflow-hidden">{children}</main>
        </div>
      </LiveProvider>
    </StoreProvider>
  );
}
