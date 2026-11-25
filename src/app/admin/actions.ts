"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { isValidContentType } from "@/lib/format";
import { sanitizePostHtml } from "@/lib/sanitize";
import { calculateReadingTime, slugify } from "@/lib/slug";
import type { Category, PostStatus } from "@/types/database";

const VALID_STATUSES: readonly PostStatus[] = [
  "draft",
  "published",
  "archived",
] as const;

export interface PostFormActionState {
  error: string | null;
}

export async function savePostAction(
  _prevState: PostFormActionState,
  formData: FormData
): Promise<PostFormActionState> {
  const { supabase, userId } = await requireAdmin();

  const postId = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const rawSlug = String(formData.get("slug") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim() || null;
  const rawContent = String(formData.get("content") ?? "");
  const coverImage = String(formData.get("cover_image") ?? "").trim() || null;
  const rawContentType = String(formData.get("content_type") ?? "artikel");
  const categoryId = String(formData.get("category_id") ?? "").trim() || null;
  const rawStatus = String(formData.get("status") ?? "draft");
  const metaDescription =
    String(formData.get("meta_description") ?? "").trim() || null;
  const isFeatured = formData.get("is_featured") === "on";

  if (!title) {
    return { error: "Judul tulisan wajib diisi." };
  }

  const slug = slugify(rawSlug || title);
  if (!slug) {
    return { error: "Slug URL tidak valid. Gunakan huruf atau angka." };
  }

  const cleanContent = sanitizePostHtml(rawContent);
  const plainCheck = cleanContent.replace(/<[^>]+>/g, "").trim();
  if (!plainCheck) {
    return { error: "Isi tulisan tidak boleh kosong." };
  }

  const contentType = isValidContentType(rawContentType)
    ? rawContentType
    : "artikel";
  const status: PostStatus = VALID_STATUSES.includes(rawStatus as PostStatus)
    ? (rawStatus as PostStatus)
    : "draft";

  const readingTime = calculateReadingTime(cleanContent);

  if (postId) {
    // Mode Edit: periksa published_at lama agar tanggal terbit pertama tetap terjaga
    const { data: existingPost } = await supabase
      .from("posts")
      .select("slug, published_at")
      .eq("id", postId)
      .single();

    if (!existingPost) {
      return { error: "Tulisan yang ingin diedit tidak ditemukan." };
    }

    const publishedAt =
      status === "published"
        ? (existingPost.published_at ?? new Date().toISOString())
        : existingPost.published_at;

    const { error } = await supabase
      .from("posts")
      .update({
        title,
        slug,
        excerpt,
        content: cleanContent,
        cover_image: coverImage,
        content_type: contentType,
        category_id: categoryId,
        status,
        reading_time: readingTime,
        meta_description: metaDescription,
        is_featured: isFeatured,
        published_at: publishedAt,
      })
      .eq("id", postId);

    if (error) {
      if (error.code === "23505") {
        return {
          error: "Slug URL sudah digunakan tulisan lain. Ubah slug terlebih dahulu.",
        };
      }
      return { error: `Gagal menyimpan perubahan: ${error.message}` };
    }

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath(`/baca/${existingPost.slug}`);
    revalidatePath(`/baca/${slug}`);
  } else {
    // Mode Buat Baru
    const publishedAt =
      status === "published" ? new Date().toISOString() : null;

    const { error } = await supabase.from("posts").insert({
      title,
      slug,
      excerpt,
      content: cleanContent,
      cover_image: coverImage,
      content_type: contentType,
      category_id: categoryId,
      author_id: userId,
      status,
      reading_time: readingTime,
      meta_description: metaDescription,
      is_featured: isFeatured,
      published_at: publishedAt,
    });

    if (error) {
      if (error.code === "23505") {
        return {
          error: "Slug URL sudah digunakan tulisan lain. Ubah slug terlebih dahulu.",
        };
      }
      return { error: `Gagal membuat tulisan: ${error.message}` };
    }

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath(`/baca/${slug}`);
  }

  redirect("/admin");
}

export async function deletePostAction(
  postId: string
): Promise<{ error: string | null }> {
  const { supabase } = await requireAdmin();

  if (!postId) {
    return { error: "ID tulisan tidak valid." };
  }

  const { data: post } = await supabase
    .from("posts")
    .select("slug")
    .eq("id", postId)
    .single();

  const { error } = await supabase.from("posts").delete().eq("id", postId);

  if (error) {
    return { error: `Gagal menghapus tulisan: ${error.message}` };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  if (post?.slug) {
    revalidatePath(`/baca/${post.slug}`);
  }

  return { error: null };
}

export async function createCategoryAction(
  name: string
): Promise<{ category: Category | null; error: string | null }> {
  const { supabase } = await requireAdmin();

  const cleanName = name.trim();
  const slug = slugify(cleanName);

  if (!cleanName || !slug) {
    return { category: null, error: "Nama kategori wajib diisi." };
  }

  const { data, error } = await supabase
    .from("categories")
    .insert({ name: cleanName, slug })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { category: null, error: "Kategori dengan nama tersebut sudah ada." };
    }
    return { category: null, error: `Gagal menambah kategori: ${error.message}` };
  }

  revalidatePath("/admin/editor");
  return { category: data, error: null };
}
