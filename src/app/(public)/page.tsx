import Link from "next/link";
import { AlertCircle, BookOpen, Database } from "lucide-react";
import { CONTENT_TYPE_META, isValidContentType } from "@/lib/format";
import { getHomeFeed } from "@/lib/posts";
import { ContentTypeFilter } from "@/components/ui/ContentTypeFilter";
import { HomeSearchForm } from "@/components/ui/HomeSearchForm";
import { FeaturedPostCard } from "@/components/ui/FeaturedPostCard";
import { PostCard } from "@/components/ui/PostCard";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; q?: string }>;
}) {
  const resolvedParams = await searchParams;
  const activeType = isValidContentType(resolvedParams.type)
    ? resolvedParams.type
    : undefined;
  const query = resolvedParams.q?.trim() ?? "";

  const { posts, featuredPost, isConfigured, errorMessage } = await getHomeFeed(
    {
      type: activeType,
      query,
    }
  );

  const activeTypeLabel = activeType
    ? CONTENT_TYPE_META[activeType].label
    : null;

  const pageHeading = query
    ? `Hasil pencarian "${query}"`
    : activeTypeLabel
      ? activeTypeLabel
      : "Jelajah Tulisan";

  const hasAnyPosts = Boolean(featuredPost) || posts.length > 0;

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:space-y-8 sm:py-10">
      {/* Header Beranda & Pencarian */}
      <section className="space-y-4">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {pageHeading}
          </h1>
          <p className="text-sm text-muted sm:text-base">
            {query
              ? `Menampilkan tulisan${activeTypeLabel ? ` kategori ${activeTypeLabel}` : ""} yang cocok dengan kata kunci.`
              : "Berita aktual, artikel informatif, dan cerpen pilihan dalam tampilan bebas distraksi."}
          </p>
        </div>

        <HomeSearchForm query={query} activeType={activeType} />

        <ContentTypeFilter activeType={activeType} query={query} />
      </section>

      {/* Peringatan konfigurasi Supabase jika .env.local masih placeholder */}
      {!isConfigured ? (
        <section
          aria-label="Informasi konfigurasi"
          className="rounded-xl border border-border bg-surface p-5 sm:p-6"
        >
          <div className="flex items-start gap-3">
            <Database
              className="mt-0.5 h-5 w-5 shrink-0 text-accent"
              aria-hidden="true"
            />
            <div className="space-y-1.5 text-sm">
              <h2 className="font-semibold text-foreground">
                Koneksi Supabase belum dikonfigurasi
              </h2>
              <p className="leading-relaxed text-muted">
                Isi <code className="rounded bg-background px-1.5 py-0.5 text-xs text-foreground">NEXT_PUBLIC_SUPABASE_URL</code> dan{" "}
                <code className="rounded bg-background px-1.5 py-0.5 text-xs text-foreground">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> pada berkas{" "}
                <code className="rounded bg-background px-1.5 py-0.5 text-xs text-foreground">.env.local</code> lalu jalankan ulang server untuk menampilkan tulisan dari database.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      {/* Pesan error query database */}
      {errorMessage ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4 text-sm text-foreground"
        >
          <AlertCircle
            className="mt-0.5 h-5 w-5 shrink-0 text-accent"
            aria-hidden="true"
          />
          <p>{errorMessage}</p>
        </div>
      ) : null}

      {/* Featured Post */}
      {featuredPost ? (
        <section aria-labelledby="featured-heading" className="space-y-3">
          <h2
            id="featured-heading"
            className="text-xs font-semibold uppercase tracking-wider text-muted"
          >
            Tulisan Pilihan
          </h2>
          <FeaturedPostCard post={featuredPost} />
        </section>
      ) : null}

      {/* Daftar Tulisan Terbaru */}
      {posts.length > 0 ? (
        <section aria-labelledby="latest-heading" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2
              id="latest-heading"
              className="text-xs font-semibold uppercase tracking-wider text-muted"
            >
              {featuredPost ? "Tulisan Terbaru" : "Daftar Tulisan"}
            </h2>
            <span className="text-xs text-muted">
              {posts.length} tulisan
            </span>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      ) : null}

      {/* Empty State ketika belum ada tulisan / hasil pencarian kosong */}
      {isConfigured && !errorMessage && !hasAnyPosts ? (
        <section className="rounded-xl border border-border bg-surface px-6 py-12 text-center">
          <BookOpen
            className="mx-auto h-8 w-8 text-muted"
            aria-hidden="true"
          />
          <h2 className="mt-3 text-base font-semibold text-foreground">
            {query || activeType
              ? "Tidak ada tulisan yang sesuai"
              : "Belum ada tulisan dipublikasikan"}
          </h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted">
            {query || activeType
              ? "Coba gunakan kata kunci lain atau pilih tab filter yang berbeda."
              : "Tulisan yang berstatus published di database akan langsung tampil di halaman ini."}
          </p>
          {query || activeType ? (
            <div className="mt-5">
              <Link
                href="/"
                className="inline-flex min-h-11 items-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:border-muted/50"
              >
                Tampilkan semua tulisan
              </Link>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
