/**
 * Mengubah judul menjadi URL slug kebab-case yang aman.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/**
 * Menghitung estimasi waktu baca (menit) dari konten HTML (asumsi 200 kata/menit).
 */
export function calculateReadingTime(html: string): number {
  const plainText = html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!plainText) return 1;
  const wordCount = plainText.split(" ").length;
  return Math.max(1, Math.ceil(wordCount / 200));
}
