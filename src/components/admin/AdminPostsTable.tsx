"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { AlertCircle, Edit3, ExternalLink, Trash2 } from "lucide-react";
import { deletePostAction } from "@/app/admin/actions";
import { CONTENT_TYPE_META, formatPublishDate } from "@/lib/format";
import type { Category, Post, PostStatus } from "@/types/database";

export interface AdminPostRow
  extends Pick<
    Post,
    | "id"
    | "title"
    | "slug"
    | "content_type"
    | "status"
    | "is_featured"
    | "reading_time"
    | "published_at"
    | "created_at"
    | "updated_at"
  > {
  category: Pick<Category, "id" | "name"> | null;
}

const STATUS_META: Record<
  PostStatus,
  { label: string; badgeClass: string }
> = {
  published: {
    label: "Published",
    badgeClass:
      "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/50 dark:text-emerald-300",
  },
  draft: {
    label: "Draft",
    badgeClass:
      "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/50 dark:text-amber-300",
  },
  archived: {
    label: "Archived",
    badgeClass: "border-border bg-background text-muted",
  },
};

export function AdminPostsTable({ posts }: { posts: AdminPostRow[] }) {
  const [statusFilter, setStatusFilter] = useState<"all" | PostStatus>("all");
  const [targetPost, setTargetPost] = useState<AdminPostRow | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const dialogRef = useRef<HTMLDialogElement>(null);

  const filteredPosts =
    statusFilter === "all"
      ? posts
      : posts.filter((post) => post.status === statusFilter);

  const openDeleteDialog = (post: AdminPostRow) => {
    setDeleteError(null);
    setTargetPost(post);
    dialogRef.current?.showModal();
  };

  const closeDeleteDialog = () => {
    dialogRef.current?.close();
    setTargetPost(null);
    setDeleteError(null);
  };

  const handleConfirmDelete = () => {
    if (!targetPost) return;
    startTransition(async () => {
      const result = await deletePostAction(targetPost.id);
      if (result.error) {
        setDeleteError(result.error);
      } else {
        closeDeleteDialog();
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Filter Status */}
      <div
        role="group"
        aria-label="Filter status tulisan"
        className="flex flex-wrap items-center gap-2"
      >
        {(
          [
            { key: "all", label: "Semua" },
            { key: "published", label: "Published" },
            { key: "draft", label: "Draft" },
            { key: "archived", label: "Archived" },
          ] as const
        ).map((tab) => {
          const isActive = statusFilter === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              aria-pressed={isActive}
              className={`inline-flex min-h-11 cursor-pointer items-center rounded-full border px-4 text-sm transition-colors ${
                isActive
                  ? "border-accent bg-accent font-semibold text-accent-foreground"
                  : "border-border bg-surface text-muted hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tabel Responsif */}
      {filteredPosts.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface px-6 py-12 text-center">
          <p className="text-sm text-muted">
            Belum ada tulisan pada status ini.
          </p>
        </div>
      ) : (
        <div
          tabIndex={0}
          role="region"
          aria-labelledby="posts-table-caption"
          className="overflow-x-auto rounded-xl border border-border bg-surface"
        >
          <table className="w-full border-collapse text-left text-sm">
            <caption id="posts-table-caption" className="sr-only">
              Daftar seluruh tulisan pada dashboard admin
            </caption>
            <thead className="hidden border-b border-border bg-background/70 text-xs uppercase tracking-wider text-muted md:table-header-group">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Judul
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Jenis
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Diperbarui
                </th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredPosts.map((post) => {
                const typeMeta = CONTENT_TYPE_META[post.content_type];
                const statusMeta = STATUS_META[post.status];
                const dateLabel = formatPublishDate(
                  post.updated_at ?? post.created_at
                );

                return (
                  <tr
                    key={post.id}
                    className="flex flex-col gap-2 p-4 md:table-row md:p-0"
                  >
                    <th
                      scope="row"
                      className="font-semibold text-foreground md:px-4 md:py-3.5"
                    >
                      <div className="space-y-1">
                        <Link
                          href={`/admin/editor?id=${post.id}`}
                          className="hover:text-accent hover:underline"
                        >
                          {post.title}
                        </Link>
                        <div className="flex flex-wrap items-center gap-2 text-xs font-normal text-muted">
                          <span>/{post.slug}</span>
                          {post.category ? (
                            <>
                              <span aria-hidden="true">&middot;</span>
                              <span>{post.category.name}</span>
                            </>
                          ) : null}
                          {post.is_featured ? (
                            <span className="rounded bg-accent/10 px-1.5 py-0.5 font-medium text-accent">
                              Pilihan
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </th>

                    <td className="md:px-4 md:py-3.5">
                      <span className="mr-2 text-xs font-medium text-muted md:hidden">
                        Jenis:
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${typeMeta.badgeClass}`}
                      >
                        {typeMeta.label}
                      </span>
                    </td>

                    <td className="md:px-4 md:py-3.5">
                      <span className="mr-2 text-xs font-medium text-muted md:hidden">
                        Status:
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusMeta.badgeClass}`}
                      >
                        {statusMeta.label}
                      </span>
                    </td>

                    <td className="text-xs text-muted md:px-4 md:py-3.5">
                      <span className="mr-2 font-medium md:hidden">
                        Diperbarui:
                      </span>
                      <time dateTime={post.updated_at}>{dateLabel}</time>
                    </td>

                    <td className="md:px-4 md:py-3.5">
                      <div className="flex flex-wrap items-center gap-1.5 md:justify-end">
                        {post.status === "published" ? (
                          <Link
                            href={`/baca/${post.slug}`}
                            aria-label={`Lihat ${post.title}`}
                            className="inline-flex min-h-11 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-xs font-medium text-muted transition-colors hover:text-foreground"
                          >
                            <ExternalLink
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            />
                            <span>Lihat</span>
                          </Link>
                        ) : null}

                        <Link
                          href={`/admin/editor?id=${post.id}`}
                          aria-label={`Edit ${post.title}`}
                          className="inline-flex min-h-11 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors hover:border-muted/50"
                        >
                          <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Edit</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => openDeleteDialog(post)}
                          aria-label={`Hapus ${post.title}`}
                          className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-md border border-red-300 bg-background px-3 text-xs font-medium text-red-700 transition-colors hover:bg-red-50 dark:border-red-900/60 dark:text-red-400 dark:hover:bg-red-950/40"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Native <dialog> untuk konfirmasi hapus */}
      <dialog
        ref={dialogRef}
        aria-labelledby="delete-dialog-title"
        onClose={() => {
          setTargetPost(null);
          setDeleteError(null);
        }}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl border border-border bg-surface p-6 text-foreground shadow-lg"
      >
        <h1
          id="delete-dialog-title"
          className="text-lg font-bold text-foreground"
        >
          Hapus tulisan ini?
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Tulisan{" "}
          <strong className="text-foreground">
            &ldquo;{targetPost?.title}&rdquo;
          </strong>{" "}
          akan dihapus permanen dan tidak dapat dikembalikan.
        </p>

        {deleteError ? (
          <div
            role="alert"
            className="mt-3 flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 p-3 text-xs text-red-900 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200"
          >
            <AlertCircle
              className="mt-0.5 h-4 w-4 shrink-0"
              aria-hidden="true"
            />
            <span>{deleteError}</span>
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            autoFocus
            onClick={closeDeleteDialog}
            disabled={isPending}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:border-muted/50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirmDelete}
            disabled={isPending}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg bg-red-600 px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Menghapus..." : "Hapus Permanen"}
          </button>
        </div>
      </dialog>
    </div>
  );
}
