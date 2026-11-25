"use client";

import { useSyncExternalStore } from "react";

type FontSizeScale = "sm" | "md" | "lg";

const STORAGE_KEY = "aksara-reading-font-size";
const FONT_SIZE_ORDER: readonly FontSizeScale[] = ["sm", "md", "lg"] as const;

const FONT_SIZE_META: Record<
  FontSizeScale,
  { label: string; proseClass: string }
> = {
  sm: { label: "Kecil", proseClass: "prose-base" },
  md: { label: "Sedang", proseClass: "prose-base sm:prose-lg" },
  lg: { label: "Besar", proseClass: "prose-lg sm:prose-xl" },
};

const listeners = new Set<() => void>();

function subscribeFontSize(callback: () => void) {
  listeners.add(callback);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) callback();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", onStorage);
  };
}

function getFontSizeSnapshot(): FontSizeScale {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "sm" || saved === "md" || saved === "lg") {
      return saved;
    }
  } catch {
    // Abaikan jika akses storage diblokir
  }
  return "md";
}

function getServerFontSizeSnapshot(): FontSizeScale {
  return "md";
}

function setStoredFontSize(next: FontSizeScale) {
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Abaikan jika akses storage diblokir
  }
  listeners.forEach((listener) => listener());
}

/**
 * Pembungkus konten artikel dengan kontrol ukuran huruf (A- / A+) dan tipografi otomatis
 * (Sans-serif untuk Berita/Artikel, Serif Lora untuk Cerpen).
 */
export function ArticleReader({
  safeHtml,
  isSerif,
}: {
  safeHtml: string;
  isSerif: boolean;
}) {
  const fontSize = useSyncExternalStore(
    subscribeFontSize,
    getFontSizeSnapshot,
    getServerFontSizeSnapshot
  );

  const currentIndex = FONT_SIZE_ORDER.indexOf(fontSize);
  const isMin = currentIndex <= 0;
  const isMax = currentIndex >= FONT_SIZE_ORDER.length - 1;

  const decreaseFontSize = () => {
    if (isMin) return;
    setStoredFontSize(FONT_SIZE_ORDER[currentIndex - 1]);
  };

  const increaseFontSize = () => {
    if (isMax) return;
    setStoredFontSize(FONT_SIZE_ORDER[currentIndex + 1]);
  };

  return (
    <div>
      {/* Kontrol Ukuran Huruf */}
      <div className="mb-6 flex items-center justify-between gap-3 border-y border-border py-2.5">
        <span className="text-xs font-medium text-muted">
          Ukuran teks:{" "}
          <span className="text-foreground">
            {FONT_SIZE_META[fontSize].label}
          </span>
        </span>

        <div
          role="group"
          aria-label="Pengaturan ukuran huruf bacaan"
          className="flex items-center gap-1"
        >
          <button
            type="button"
            onClick={decreaseFontSize}
            aria-disabled={isMin}
            aria-label="Perkecil ukuran huruf"
            className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-border bg-surface px-3 text-sm font-semibold transition-colors ${
              isMin
                ? "cursor-not-allowed text-muted/50"
                : "cursor-pointer text-foreground hover:border-muted/50"
            }`}
          >
            A-
          </button>
          <button
            type="button"
            onClick={increaseFontSize}
            aria-disabled={isMax}
            aria-label="Perbesar ukuran huruf"
            className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-border bg-surface px-3 text-sm font-semibold transition-colors ${
              isMax
                ? "cursor-not-allowed text-muted/50"
                : "cursor-pointer text-foreground hover:border-muted/50"
            }`}
          >
            A+
          </button>
        </div>
      </div>

      {/* Isi Tulisan Tersanitasi */}
      <div
        className={`prose prose-zinc dark:prose-invert max-w-none prose-headings:tracking-tight prose-a:text-accent prose-blockquote:border-accent prose-img:rounded-lg ${
          FONT_SIZE_META[fontSize].proseClass
        } ${
          isSerif
            ? "font-serif leading-loose prose-p:leading-loose"
            : "font-sans leading-relaxed"
        }`}
        dangerouslySetInnerHTML={{ __html: safeHtml }}
      />
    </div>
  );
}
