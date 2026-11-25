import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { CONTENT_TYPE_META, formatPublishDate } from "@/lib/format";
import type { PostSummary } from "@/lib/posts";

/**
 * Kartu tulisan pilihan (Featured Post) pada bagian atas Beranda.
 */
export function FeaturedPostCard({ post }: { post: PostSummary }) {
  const typeMeta = CONTENT_TYPE_META[post.content_type];
  const formattedDate = formatPublishDate(post.published_at ?? post.created_at);

  return (
    <article className="group relative overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-muted/50">
      <div
        className={
          post.cover_image ? "grid md:grid-cols-12" : "flex flex-col"
        }
      >
        {post.cover_image ? (
          <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-border bg-background md:col-span-6 md:aspect-auto md:min-h-72 md:border-r md:border-b-0">
            <Image
              src={post.cover_image}
              alt={post.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </div>
        ) : null}

        <div
          className={`flex flex-col justify-between p-5 sm:p-7 ${
            post.cover_image ? "md:col-span-6" : ""
          }`}
        >
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">
                Pilihan
              </span>
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${typeMeta.badgeClass}`}
              >
                {typeMeta.label}
              </span>
              {post.category ? (
                <span className="text-xs text-muted">{post.category.name}</span>
              ) : null}
            </div>

            <h2
              className={`mt-3 text-xl font-bold tracking-tight text-foreground sm:text-2xl ${
                typeMeta.isSerif ? "font-serif" : "font-sans"
              }`}
            >
              <Link
                href={`/baca/${post.slug}`}
                className="rounded-sm after:absolute after:inset-0"
              >
                {post.title}
              </Link>
            </h2>

            {post.excerpt ? (
              <p
                className={`mt-2.5 line-clamp-3 text-sm leading-relaxed text-muted sm:text-base ${
                  typeMeta.isSerif ? "font-serif" : "font-sans"
                }`}
              >
                {post.excerpt}
              </p>
            ) : null}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-xs text-muted sm:text-sm">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              {post.author?.full_name ? (
                <span className="font-medium text-foreground">
                  {post.author.full_name}
                </span>
              ) : null}
              {formattedDate ? (
                <time dateTime={post.published_at ?? post.created_at}>
                  {formattedDate}
                </time>
              ) : null}
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{post.reading_time} menit baca</span>
              </span>
            </div>

            <span className="inline-flex items-center gap-1 font-medium text-accent">
              <span>Baca</span>
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
