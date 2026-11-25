import Link from "next/link";
import { Search, X } from "lucide-react";
import type { ContentType } from "@/types/database";

/**
 * Form pencarian cepat berbasis GET (?q=...) yang ramah IME dan berfungsi tanpa JS.
 */
export function HomeSearchForm({
  query,
  activeType,
}: {
  query?: string;
  activeType?: ContentType;
}) {
  const clearHref = activeType ? `/?type=${activeType}` : "/";

  return (
    <form
      action="/"
      method="GET"
      role="search"
      aria-label="Cari tulisan"
      className="flex items-center gap-2"
    >
      {activeType ? (
        <input type="hidden" name="type" value={activeType} />
      ) : null}

      <div className="relative flex-1">
        <label htmlFor="home-search-input" className="sr-only">
          Cari judul atau cuplikan tulisan
        </label>
        <Search
          className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
        <input
          id="home-search-input"
          name="q"
          type="search"
          defaultValue={query ?? ""}
          placeholder="Cari judul atau cuplikan tulisan..."
          className="min-h-11 w-full rounded-lg border border-input-border bg-surface pr-3 pl-10 text-sm text-foreground placeholder:text-muted"
        />
      </div>

      <button
        type="submit"
        className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg bg-accent px-4 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
      >
        Cari
      </button>

      {query ? (
        <Link
          href={clearHref}
          aria-label="Hapus kata kunci pencarian"
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border bg-surface px-3 text-sm text-muted transition-colors hover:text-foreground"
        >
          <X className="h-4 w-4 sm:mr-1.5" aria-hidden="true" />
          <span className="hidden sm:inline">Reset</span>
        </Link>
      ) : null}
    </form>
  );
}
