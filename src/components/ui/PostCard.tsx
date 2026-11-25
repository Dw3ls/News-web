import Image from "next/image";
import Link from "next/link";
import { Clock } from "lucide-react";
import { CONTENT_TYPE_META, formatPublishDate } from "@/lib/format";
import type { PostSummary } from "@/lib/posts";

/**
 * Kartu tulisan editorial minimalis untuk daftar tulisan di Beranda.
 */
export function PostCard({ post }: { post: PostSummary }) {
  const typeMeta = CONTENT_TYPE_META[post.content_type];
  const formattedDate = formatPublishDate(post.published_at ?? post.created_at);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-muted/50">
      {post.cover_image ? (
        <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-border bg-background">
          <Image
            src={post.cover_image}
            alt={post.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </div>
      ) : null}

      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${typeMeta.badgeClass}`}
            >
              {typeMeta.label}
            </span>
            {post.category ? (
              <span className="text-xs text-muted">{post.category.name}</span>
            ) : null}
          </div>

          <h3
            className={`mt-3 text-lg font-semibold leading-snug tracking-tight text-foreground group-hover:text-accent ${
              typeMeta.isSerif ? "font-serif" : "font-sans"
            }`}
          >
            <Link
              href={`/baca/${post.slug}`}
              className="rounded-sm after:absolute after:inset-0"
            >
              {post.title}
            </Link>
          </h3>

          {post.excerpt ? (
            <p
              className={`mt-2 line-clamp-3 text-sm leading-relaxed text-muted ${
                typeMeta.isSerif ? "font-serif" : "font-sans"
              }`}
            >
              {post.excerpt}
            </p>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-xs text-muted">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
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
          </div>

          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{post.reading_time} mnt</span>
          </span>
        </div>
      </div>
    </article>
  );
}
