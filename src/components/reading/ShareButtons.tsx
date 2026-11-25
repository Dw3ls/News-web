"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Check, Copy, Share2 } from "lucide-react";

const emptySubscribe = () => () => {};

function useCurrentOrigin(): string {
  return useSyncExternalStore(
    emptySubscribe,
    () => window.location.origin,
    () => ""
  );
}

function legacyCopy(text: string): boolean {
  const previousFocus = document.activeElement as HTMLElement | null;
  const field = document.createElement("textarea");
  field.value = text;
  field.setAttribute("readonly", "");
  field.style.cssText = "position:fixed;top:0;left:0;opacity:0";
  document.body.append(field);
  field.select();

  try {
    return document.execCommand("copy");
  } finally {
    field.remove();
    previousFocus?.focus({ preventScroll: true });
  }
}

/**
 * Tombol berbagi tautan (Salin Tautan & WhatsApp) dengan live region terpisah
 * dan tap target minimal 44x44px.
 */
export function ShareButtons({
  title,
  slug,
}: {
  title: string;
  slug: string;
}) {
  const origin = useCurrentOrigin();
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
    "idle"
  );
  const [statusMessage, setStatusMessage] = useState("");
  const lastMessageRef = useRef("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const announce = (ok: boolean) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setCopyState(ok ? "copied" : "failed");

    let message = ok ? "Tautan tersalin" : "Gagal menyalin";
    // Ubah sedikit string jika berulang agar screen reader (VoiceOver) tetap mengumumkan
    if (message === lastMessageRef.current) {
      message += "\u00A0";
    }
    lastMessageRef.current = message;
    setStatusMessage(message);

    timerRef.current = setTimeout(() => {
      setCopyState("idle");
      setStatusMessage("");
    }, 2200);
  };

  const sharePath = `/baca/${slug}`;
  const shareUrl = origin ? `${origin}${sharePath}` : sharePath;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      announce(true);
    } catch {
      if (legacyCopy(shareUrl)) {
        announce(true);
      } else {
        announce(false);
      }
    }
  };

  const whatsappText = encodeURIComponent(`${title} — ${shareUrl}`);

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-medium text-foreground transition-colors hover:border-muted/50"
        >
          {copyState === "copied" ? (
            <Check className="h-4 w-4 text-accent" aria-hidden="true" />
          ) : (
            <Copy className="h-4 w-4 text-muted" aria-hidden="true" />
          )}
          <span>
            {copyState === "copied"
              ? "Tautan tersalin"
              : copyState === "failed"
                ? "Gagal menyalin"
                : "Salin tautan"}
          </span>
        </button>

        {/* Live region berada di luar <button> agar diumumkan konsisten oleh screen reader */}
        <span role="status" className="sr-only">
          {statusMessage}
        </span>
      </div>

      <a
        href={`https://wa.me/?text=${whatsappText}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-medium text-foreground transition-colors hover:border-muted/50"
      >
        <Share2 className="h-4 w-4 text-muted" aria-hidden="true" />
        <span>WhatsApp</span>
      </a>
    </div>
  );
}
