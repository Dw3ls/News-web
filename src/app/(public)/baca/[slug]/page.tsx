import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import { CONTENT_TYPE_META, formatPublishDate } from "@/lib/format";
import { getPostBySlug, getRelatedPosts } from "@/lib/posts";
import { sanitizePostHtml } from "@/lib/sanitize";
import { ReadingProgressBar } from "@/components/reading/ReadingProgressBar";
import { ArticleReader } from "@/components/reading/ArticleReader";
import { ShareButtons } from "@/components/reading/ShareButtons";
import { PostCard } from "@/components/ui/PostCard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: "Tulisan Tidak Ditemukan",
    };
  }

  const description =
    post.meta_description ??
    post.excerpt ??
    `Baca ${post.title} di Aksara.`;

  return {
    title: post.title,
    description,
    openGraph: {
      title: post.title,
      description,
      type: "article",
      publishedTime: post.published_at ?? post.created_at,
      modifiedTime: post.updated_at,
      authors: post.author?.full_name ? [post.author.full_name] : undefined,
      images: post.cover_image ? [{ url: post.cover_image, alt: post.title }] : undefined,
    },
    twitter: {
      card: post.cover_image ? "summary_large_image" : "summary",
      title: post.title,
      description,
      images: post.cover_image ? [post.cover_image] : undefined,
    },
  };
}

export default async function ReadPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const typeMeta = CONTENT_TYPE_META[post.content_type];
  const formattedDate = formatPublishDate(post.published_at ?? post.created_at);
  const safeHtml = sanitizePostHtml(post.content);

  const relatedPosts = await getRelatedPosts({
    postId: post.id,
    categoryId: post.category_id,
    contentType: post.content_type,
  });

  return (
    <>
      <ReadingProgressBar />

      <article className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
        {/* Tautan kembali ke Beranda */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>

        {/* Header Tulisan */}
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/?type=${post.content_type}`}
              className={`inline-flex min-h-8 items-center rounded-full border px-3 py-1 text-xs font-medium transition-opacity hover:opacity-80 ${typeMeta.badgeClass}`}
            >
              {typeMeta.label}
            </Link>
            {post.category ? (
              <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted">
                {post.category.name}
              </span>
            ) : null}
          </div>

          <h1
            className={`text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl ${
              typeMeta.isSerif ? "font-serif" : "font-sans"
            }`}
          >
            {post.title}
          </h1>

          {post.excerpt ? (
            <p
              className={`text-base leading-relaxed text-muted sm:text-lg ${
                typeMeta.isSerif ? "font-serif" : "font-sans"
              }`}
            >
              {post.excerpt}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-sm text-muted">
            {post.author?.full_name ? (
              <span className="font-medium text-foreground">
                {post.author.full_name}
              </span>
            ) : null}
            {post.author?.full_name && formattedDate ? (
              <span aria-hidden="true">&middot;</span>
            ) : null}
            {formattedDate ? (
              <time dateTime={post.published_at ?? post.created_at}>
                {formattedDate}
              </time>
            ) : null}
            <span aria-hidden="true">&middot;</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-4 w-4" aria-hidden="true" />
              <span>{post.reading_time} menit baca</span>
            </span>
          </div>
        </header>

        {/* Gambar Sampul Opsional */}
        {post.cover_image ? (
          <figure className="my-6 overflow-hidden rounded-xl border border-border bg-surface sm:my-8">
            <div className="relative aspect-[16/9] w-full">
              <Image
                src={post.cover_image}
                alt={post.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 672px"
                className="object-cover"
              />
            </div>
          </figure>
        ) : (
          <div className="my-6" />
        )}

        {/* Isi Bacaan & Kontrol Ukuran Huruf */}
        <ArticleReader safeHtml={safeHtml} isSerif={typeMeta.isSerif} />

        {/* Bagian Penulis & Berbagi */}
        <footer className="mt-10 space-y-6 border-t border-border pt-6">
          {post.author?.bio ? (
            <div className="rounded-xl border border-border bg-surface p-4 sm:p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                Tentang Penulis
              </p>
              <p className="mt-1 font-semibold text-foreground">
                {post.author.full_name}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                {post.author.bio}
              </p>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-foreground">
              Bagikan tulisan ini
            </p>
            <ShareButtons title={post.title} slug={post.slug} />
          </div>
        </footer>
      </article>

      {/* Rekomendasi 3 Tulisan Terkait */}
      {relatedPosts.length > 0 ? (
        <section
          aria-labelledby="related-posts-heading"
          className="border-t border-border bg-surface/50"
        >
          <div className="mx-auto max-w-5xl space-y-5 px-4 py-10 sm:py-12">
            <h2
              id="related-posts-heading"
              className="text-lg font-bold tracking-tight text-foreground sm:text-xl"
            >
              Bacaan Terkait
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((related) => (
                <PostCard key={related.id} post={related} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
