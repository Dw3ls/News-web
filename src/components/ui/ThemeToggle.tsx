"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

const emptySubscribe = () => () => {};

function useIsHydrated() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

/**
 * Tombol pengalih tema Light/Dark Mode dengan tap target minimal 44x44px.
 * Mengikuti pola two-state override: kembali ke 'system' bila target sama dengan preferensi OS.
 */
export function ThemeToggle() {
  const { resolvedTheme, systemTheme, setTheme } = useTheme();
  const isHydrated = useIsHydrated();

  const handleToggle = () => {
    const current = resolvedTheme === "dark" ? "dark" : "light";
    const target = current === "dark" ? "light" : "dark";

    // Jika target sama dengan preferensi OS, kembalikan ke 'system' agar tidak mengunci permanen
    if (systemTheme && target === systemTheme) {
      setTheme("system");
    } else {
      setTheme(target);
    }
  };

  if (!isHydrated) {
    return (
      <button
        type="button"
        aria-label="Ganti tema tampilan"
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-muted transition-colors"
        disabled
      >
        <span className="h-5 w-5" aria-hidden="true" />
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={isDark ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
      className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-md text-muted transition-colors hover:bg-background hover:text-foreground"
    >
      {isDark ? (
        <Sun className="h-5 w-5" aria-hidden="true" />
      ) : (
        <Moon className="h-5 w-5" aria-hidden="true" />
      )}
    </button>
  );
}
