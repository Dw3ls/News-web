import type { Metadata } from "next";
import Link from "next/link";
import { FilePlus2 } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import {
  AdminPostsTable,
  type AdminPostRow,
} from "@/components/admin/AdminPostsTable";

export const metadata: Metadata = {
  title: "Dashboard Admin",
};

export default async function AdminDashboardPage() {
  const { supabase } = await requireAdmin();

  const { data } = await supabase
    .from("posts")
    .select(
      `
      id,
      title,
      slug,
      content_type,
      status,
      is_featured,
      reading_time,
      published_at,
      created_at,
      updated_at,
      category:categories(id, name)
    `
    )
    .order("updated_at", { ascending: false });

  const posts = (data ?? []) as unknown as AdminPostRow[];
  const publishedCount = posts.filter((p) => p.status === "published").length;
  const draftCount = posts.filter((p) => p.status === "draft").length;

  return (
    <div className="space-y-6">
      {/* Header Dashboard */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Kelola Tulisan
          </h1>
          <p className="mt-1 text-sm text-muted">
            Buat, sunting, dan atur status publikasi berita, artikel, maupun cerpen.
          </p>
        </div>

        <Link
          href="/admin/editor"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
        >
          <FilePlus2 className="h-4 w-4" aria-hidden="true" />
          <span>Buat Tulisan Baru</span>
        </Link>
      </div>

      {/* Ringkasan Statistik */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs font-medium text-muted">Total Tulisan</p>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {posts.length}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs font-medium text-muted">Published</p>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {publishedCount}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs font-medium text-muted">Draft</p>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {draftCount}
          </p>
        </div>
      </div>

      {/* Tabel Daftar Tulisan */}
      <AdminPostsTable posts={posts} />
    </div>
  );
}
