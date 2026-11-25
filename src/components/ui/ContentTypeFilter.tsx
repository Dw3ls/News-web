import Link from "next/link";
import type { ContentType } from "@/types/database";

const FILTER_TABS: Array<{ label: string; value: ContentType | null }> = [
  { label: "Semua", value: null },
  { label: "Berita", value: "berita" },
  { label: "Artikel", value: "artikel" },
  { label: "Cerpen", value: "cerpen" },
  { label: "Lainnya", value: "lainnya" },
];

function buildFilterHref(type: ContentType | null, query?: string): string {
  const params = new URLSearchParams();
  if (type) params.set("type", type);
  if (query?.trim()) params.set("q", query.trim());
  const qs = params.toString();
  return qs ? `/?${qs}` : "/";
}

/**
 * Filter jenis konten berbentuk horizontal scrollable pills (mobile-first).
 * Semua pill memiliki tap target tinggi minimal 44px (min-h-11).
 */
export function ContentTypeFilter({
  activeType,
  query,
}: {
  activeType?: ContentType;
  query?: string;
}) {
  return (
    <nav aria-label="Filter jenis konten" className="-mx-4 px-4 sm:mx-0 sm:px-0">
      <ul className="horizontal-scroll-fade flex items-center gap-2 pb-2">
        {FILTER_TABS.map((tab) => {
          const isActive =
            tab.value === null ? !activeType : activeType === tab.value;

          return (
            <li key={tab.label} className="shrink-0">
              <Link
                href={buildFilterHref(tab.value, query)}
                aria-current={isActive ? "page" : undefined}
                className={`inline-flex min-h-11 items-center rounded-full border px-4 text-sm whitespace-nowrap transition-colors ${
                  isActive
                    ? "border-accent bg-accent font-semibold text-accent-foreground"
                    : "border-border bg-surface text-muted hover:border-muted/50 hover:text-foreground"
                }`}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
