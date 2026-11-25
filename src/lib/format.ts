import type { ContentType } from "@/types/database";

export const VALID_CONTENT_TYPES: readonly ContentType[] = [
  "berita",
  "artikel",
  "cerpen",
  "lainnya",
] as const;

export const CONTENT_TYPE_META: Record<
  ContentType,
  { label: string; badgeClass: string; isSerif: boolean }
> = {
  berita: {
    label: "Berita",
    badgeClass: "border-accent/30 bg-accent/10 text-accent",
    isSerif: false,
  },
  artikel: {
    label: "Artikel",
    badgeClass: "border-border bg-background text-foreground",
    isSerif: false,
  },
  cerpen: {
    label: "Cerpen",
    badgeClass: "border-accent/30 bg-accent/10 text-accent",
    isSerif: true,
  },
  lainnya: {
    label: "Lainnya",
    badgeClass: "border-border bg-background text-muted",
    isSerif: false,
  },
};

export function isValidContentType(value: string | undefined): value is ContentType {
  return Boolean(value && VALID_CONTENT_TYPES.includes(value as ContentType));
}

export function formatPublishDate(dateString: string | null): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
