"use client";

import { useActionState, useState, useTransition } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  ImagePlus,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import {
  createCategoryAction,
  savePostAction,
  type PostFormActionState,
} from "@/app/admin/actions";
import { TiptapEditor } from "@/components/admin/TiptapEditor";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/slug";
import type { Category, ContentType, Post, PostStatus } from "@/types/database";

const initialState: PostFormActionState = { error: null };

const CONTENT_TYPES: Array<{ value: ContentType; label: string }> = [
  { value: "berita", label: "Berita" },
  { value: "artikel", label: "Artikel" },
  { value: "cerpen", label: "Cerpen" },
  { value: "lainnya", label: "Lainnya" },
];

const STATUS_OPTIONS: Array<{ value: PostStatus; label: string }> = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

export function PostEditorForm({
  initialPost,
  initialCategories,
}: {
  initialPost: Post | null;
  initialCategories: Category[];
}) {
  const [state, formAction, isPending] = useActionState(
    savePostAction,
    initialState
  );

  const [title, setTitle] = useState(initialPost?.title ?? "");
  const [slug, setSlug] = useState(initialPost?.slug ?? "");
  const [isSlugEdited, setIsSlugEdited] = useState(Boolean(initialPost));
  const [content, setContent] = useState(initialPost?.content ?? "<p></p>");
  const [contentType, setContentType] = useState<ContentType>(
    initialPost?.content_type ?? "artikel"
  );
  const [status, setStatus] = useState<PostStatus>(
    initialPost?.status ?? "draft"
  );
  const [coverImage, setCoverImage] = useState(initialPost?.cover_image ?? "");
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    initialPost?.category_id ?? ""
  );
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [isCreatingCategory, startCategoryTransition] = useTransition();

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!isSlugEdited) {
      setSlug(slugify(value));
    }
  };

  const handleCoverUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
    ];
    if (!allowedTypes.includes(file.type)) {
      setUploadError(
        "Format gambar harus JPG, PNG, WebP, atau AVIF."
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Ukuran gambar maksimal 5 MB.");
      return;
    }

    setIsUploadingCover(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const filePath = `posts/${fileName}`;

      const { error: uploadErr } = await supabase.storage
        .from("covers")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadErr) {
        setUploadError(
          `Gagal mengunggah gambar ke bucket 'covers': ${uploadErr.message}`
        );
        return;
      }

      const { data: urlData } = supabase.storage
        .from("covers")
        .getPublicUrl(filePath);

      setCoverImage(urlData.publicUrl);
    } catch {
      setUploadError("Terjadi kesalahan saat mengunggah gambar sampul.");
    } finally {
      setIsUploadingCover(false);
      event.target.value = "";
    }
  };

  const handleAddCategory = () => {
    setCategoryError(null);
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      setCategoryError("Nama kategori tidak boleh kosong.");
      return;
    }

    startCategoryTransition(async () => {
      const result = await createCategoryAction(trimmed);
      if (result.error || !result.category) {
        setCategoryError(result.error ?? "Gagal menambah kategori.");
        return;
      }
      const created = result.category;
      setCategories((prev) =>
        [...prev, created].sort((a, b) => a.name.localeCompare(b.name))
      );
      setSelectedCategoryId(created.id);
      setNewCategoryName("");
      setIsAddingCategory(false);
    });
  };

  return (
    <form action={formAction} method="POST" className="space-y-6">
      {initialPost ? (
        <input type="hidden" name="id" value={initialPost.id} />
      ) : null}
      <input type="hidden" name="content" value={content} />

      {/* Header Aksi Editor */}
      <div className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Link
            href="/admin"
            className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Kembali ke Dashboard</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {initialPost ? "Edit Tulisan" : "Tulis Konten Baru"}
          </h1>
        </div>

        <button
          type="submit"
          disabled={isPending || isUploadingCover}
          className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-lg bg-accent px-5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save className="h-4 w-4" aria-hidden="true" />
          <span>
            {isPending
              ? "Menyimpan..."
              : initialPost
                ? "Simpan Perubahan"
                : "Simpan Tulisan"}
          </span>
        </button>
      </div>

      {state.error ? (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-900 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{state.error}</span>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Kolom Utama: Judul, Slug, Editor Tiptap */}
        <div className="space-y-5 lg:col-span-8">
          <div className="space-y-1.5">
            <label
              htmlFor="post-title"
              className="block text-sm font-medium text-foreground"
            >
              Judul Tulisan <span aria-hidden="true">*</span>
            </label>
            <input
              id="post-title"
              name="title"
              type="text"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Masukkan judul tulisan yang jelas..."
              className="min-h-12 w-full rounded-lg border border-input-border bg-surface px-3.5 text-base font-semibold text-foreground placeholder:text-muted"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="post-slug"
              className="block text-sm font-medium text-foreground"
            >
              Slug URL <span aria-hidden="true">*</span>
            </label>
            <input
              id="post-slug"
              name="slug"
              type="text"
              required
              value={slug}
              onChange={(e) => {
                setIsSlugEdited(true);
                setSlug(e.target.value);
              }}
              spellCheck={false}
              placeholder="judul-tulisan-anda"
              aria-describedby="slug-hint"
              className="min-h-11 w-full rounded-lg border border-input-border bg-surface px-3.5 text-sm text-foreground placeholder:text-muted"
            />
            <p id="slug-hint" className="text-xs text-muted">
              Pratinjau tautan: <span className="text-foreground">/baca/{slug || "slug-tulisan"}</span>
            </p>
          </div>

          <div className="space-y-1.5">
            <p className="text-sm font-medium text-foreground">
              Isi Tulisan <span aria-hidden="true">*</span>
            </p>
            <TiptapEditor
              initialContent={content}
              isSerif={contentType === "cerpen"}
              onChange={setContent}
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="post-excerpt"
              className="block text-sm font-medium text-foreground"
            >
              Cuplikan Singkat (Excerpt)
            </label>
            <textarea
              id="post-excerpt"
              name="excerpt"
              rows={3}
              defaultValue={initialPost?.excerpt ?? ""}
              placeholder="Ringkasan singkat 1–2 kalimat yang tampil pada kartu beranda..."
              className="w-full rounded-lg border border-input-border bg-surface p-3.5 text-base text-foreground placeholder:text-muted"
            />
          </div>
        </div>

        {/* Sidebar Pengaturan Publikasi */}
        <div className="space-y-5 lg:col-span-4">
          {/* Jenis Konten */}
          <fieldset className="rounded-xl border border-border bg-surface p-4">
            <legend className="px-1 text-sm font-semibold text-foreground">
              Jenis Konten
            </legend>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {CONTENT_TYPES.map((item) => {
                const isSelected = contentType === item.value;
                return (
                  <label
                    key={item.value}
                    className={`flex min-h-11 cursor-pointer items-center justify-center rounded-lg border px-3 text-sm font-medium transition-colors ${
                      isSelected
                        ? "border-accent bg-accent text-accent-foreground"
                        : "border-border bg-background text-muted hover:text-foreground"
                    }`}
                  >
                    <input
                      type="radio"
                      name="content_type"
                      value={item.value}
                      checked={isSelected}
                      onChange={() => setContentType(item.value)}
                      className="sr-only"
                    />
                    <span>{item.label}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {/* Status Publikasi */}
          <fieldset className="rounded-xl border border-border bg-surface p-4">
            <legend className="px-1 text-sm font-semibold text-foreground">
              Status Publikasi
            </legend>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {STATUS_OPTIONS.map((item) => {
                const isSelected = status === item.value;
                return (
                  <label
                    key={item.value}
                    className={`flex min-h-11 cursor-pointer items-center justify-center rounded-lg border px-2 text-xs font-medium transition-colors sm:text-sm ${
                      isSelected
                        ? "border-accent bg-accent text-accent-foreground"
                        : "border-border bg-background text-muted hover:text-foreground"
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={item.value}
                      checked={isSelected}
                      onChange={() => setStatus(item.value)}
                      className="sr-only"
                    />
                    <span>{item.label}</span>
                  </label>
                );
              })}
            </div>

            <label className="mt-4 flex min-h-11 cursor-pointer items-center gap-2.5 text-sm text-foreground">
              <input
                type="checkbox"
                name="is_featured"
                defaultChecked={initialPost?.is_featured ?? false}
                className="h-4 w-4 rounded border-input-border"
              />
              <span>Jadikan Tulisan Pilihan (Featured)</span>
            </label>
          </fieldset>

          {/* Kategori */}
          <div className="space-y-3 rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="post-category"
                className="text-sm font-semibold text-foreground"
              >
                Kategori
              </label>
              <button
                type="button"
                onClick={() => {
                  setCategoryError(null);
                  setIsAddingCategory((prev) => !prev);
                }}
                className="inline-flex min-h-9 cursor-pointer items-center gap-1 rounded-md px-2 text-xs font-medium text-accent hover:bg-background"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Tambah</span>
              </button>
            </div>

            <select
              id="post-category"
              name="category_id"
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="min-h-11 w-full rounded-lg border border-input-border bg-background px-3 text-base text-foreground"
            >
              <option value="">Tanpa kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {isAddingCategory ? (
              <div className="space-y-2 border-t border-border pt-3">
                <label htmlFor="new-category-name" className="sr-only">
                  Nama kategori baru
                </label>
                <div className="flex gap-2">
                  <input
                    id="new-category-name"
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Nama kategori baru"
                    className="min-h-11 flex-1 rounded-lg border border-input-border bg-background px-3 text-sm text-foreground"
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    disabled={isCreatingCategory}
                    className="inline-flex min-h-11 cursor-pointer items-center rounded-lg bg-accent px-3 text-xs font-semibold text-accent-foreground disabled:opacity-60"
                  >
                    {isCreatingCategory ? "..." : "Simpan"}
                  </button>
                </div>
                {categoryError ? (
                  <p role="alert" className="text-xs text-red-600 dark:text-red-400">
                    {categoryError}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          {/* Gambar Sampul (Cover Image) */}
          <div className="space-y-3 rounded-xl border border-border bg-surface p-4">
            <p className="text-sm font-semibold text-foreground">
              Gambar Sampul (Cover)
            </p>

            {coverImage ? (
              <div className="relative overflow-hidden rounded-lg border border-border bg-background">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverImage}
                  alt="Pratinjau gambar sampul"
                  className="aspect-[16/9] w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setCoverImage("")}
                  aria-label="Hapus gambar sampul"
                  className="absolute top-2 right-2 inline-flex min-h-10 min-w-10 cursor-pointer items-center justify-center rounded-md bg-surface/90 text-red-600 shadow-sm hover:bg-surface"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            ) : null}

            <div>
              <label
                htmlFor="cover-upload"
                className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-input-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:border-accent"
              >
                <ImagePlus className="h-4 w-4 text-accent" aria-hidden="true" />
                <span>
                  {isUploadingCover
                    ? "Mengunggah gambar..."
                    : "Unggah ke Supabase Storage"}
                </span>
              </label>
              <input
                id="cover-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={handleCoverUpload}
                disabled={isUploadingCover}
                className="sr-only"
              />
            </div>

            {uploadError ? (
              <p role="alert" className="text-xs text-red-600 dark:text-red-400">
                {uploadError}
              </p>
            ) : null}

            <div className="space-y-1">
              <label
                htmlFor="cover-url"
                className="block text-xs text-muted"
              >
                Atau tempel URL gambar sampul
              </label>
              <input
                id="cover-url"
                name="cover_image"
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://..."
                className="min-h-11 w-full rounded-lg border border-input-border bg-background px-3 text-sm text-foreground placeholder:text-muted"
              />
            </div>
          </div>

          {/* SEO Metadata */}
          <div className="space-y-1.5 rounded-xl border border-border bg-surface p-4">
            <label
              htmlFor="meta-description"
              className="block text-sm font-semibold text-foreground"
            >
              Deskripsi SEO (Meta Description)
            </label>
            <textarea
              id="meta-description"
              name="meta_description"
              rows={3}
              defaultValue={initialPost?.meta_description ?? ""}
              placeholder="Deskripsi singkat untuk mesin pencari dan pratinjau media sosial..."
              className="w-full rounded-lg border border-input-border bg-background p-3 text-sm text-foreground placeholder:text-muted"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
