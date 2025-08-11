"use client";

import { SessionProvider } from "next-auth/react";
import { SettingsProvider } from "@/contexts/settings-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SettingsProvider>{children}</SettingsProvider>
    </SessionProvider>
  );
}
