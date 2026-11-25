import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { isValidContentType } from "@/lib/format";
import type { Category, ContentType, Post, Profile } from "@/types/database";

export interface PostSummary
  extends Pick<
    Post,
    | "id"
    | "title"
    | "slug"
    | "excerpt"
    | "cover_image"
    | "content_type"
    | "reading_time"
    | "is_featured"
    | "published_at"
    | "created_at"
  > {
  category: Pick<Category, "id" | "name" | "slug"> | null;
  author: Pick<Profile, "id" | "full_name" | "username" | "avatar_url"> | null;
}

export interface HomeFeedResult {
  posts: PostSummary[];
  featuredPost: PostSummary | null;
  isConfigured: boolean;
  errorMessage: string | null;
}

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key && !url.includes("your-project-ref"));
}

function sanitizePostgrestSearch(raw: string): string {
  return raw.replace(/[,()*%\\]/g, " ").replace(/\s+/g, " ").trim();
}

export async function getHomeFeed(params: {
  type?: string;
  query?: string;
}): Promise<HomeFeedResult> {
  if (!isSupabaseConfigured()) {
    return {
      posts: [],
      featuredPost: null,
      isConfigured: false,
      errorMessage: null,
    };
  }

  try {
    const supabase = await createClient();
    const activeType: ContentType | undefined = isValidContentType(params.type)
      ? params.type
      : undefined;
    const rawQuery = params.query?.trim() ?? "";
    const safeQuery = rawQuery ? sanitizePostgrestSearch(rawQuery) : "";

    let dbQuery = supabase
      .from("posts")
      .select(
        `
        id,
        title,
        slug,
        excerpt,
        cover_image,
        content_type,
        reading_time,
        is_featured,
        published_at,
        created_at,
        category:categories(id, name, slug),
        author:profiles(id, full_name, username, avatar_url)
      `
      )
      .eq("status", "published")
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(30);

    if (activeType) {
      dbQuery = dbQuery.eq("content_type", activeType);
    }

    if (safeQuery) {
      dbQuery = dbQuery.or(
        `title.ilike.%${safeQuery}%,excerpt.ilike.%${safeQuery}%`
      );
    }

    const { data, error } = await dbQuery;

    if (error) {
      return {
        posts: [],
        featuredPost: null,
        isConfigured: true,
        errorMessage: "Gagal memuat daftar tulisan. Silakan coba lagi nanti.",
      };
    }

    const allPosts = (data ?? []) as unknown as PostSummary[];

    // Featured post hanya ditampilkan pada tab 'Semua' saat tidak ada query pencarian
    const showFeatured = !activeType && !safeQuery;
    const featuredPost = showFeatured
      ? (allPosts.find((p) => p.is_featured) ?? allPosts[0] ?? null)
      : null;

    const remainingPosts = featuredPost
      ? allPosts.filter((p) => p.id !== featuredPost.id)
      : allPosts;

    return {
      posts: remainingPosts,
      featuredPost,
      isConfigured: true,
      errorMessage: null,
    };
  } catch {
    return {
      posts: [],
      featuredPost: null,
      isConfigured: true,
      errorMessage: "Terjadi kesalahan saat menghubungkan ke server data.",
    };
  }
}

export interface PostDetail extends Post {
  category: Pick<Category, "id" | "name" | "slug"> | null;
  author: Pick<
    Profile,
    "id" | "full_name" | "username" | "avatar_url" | "bio"
  > | null;
}

const POST_SUMMARY_SELECT = `
  id,
  title,
  slug,
  excerpt,
  cover_image,
  content_type,
  reading_time,
  is_featured,
  published_at,
  created_at,
  category:categories(id, name, slug),
  author:profiles(id, full_name, username, avatar_url)
`;

export const getPostBySlug = cache(
  async (slug: string): Promise<PostDetail | null> => {
    if (!isSupabaseConfigured()) return null;

    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("posts")
        .select(
          `
          *,
          category:categories(id, name, slug),
          author:profiles(id, full_name, username, avatar_url, bio)
        `
        )
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();

      if (error || !data) return null;
      return data as unknown as PostDetail;
    } catch {
      return null;
    }
  }
);

export async function getRelatedPosts(params: {
  postId: string;
  categoryId: string | null;
  contentType: ContentType;
}): Promise<PostSummary[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createClient();

    // Utamakan tulisan dengan kategori atau jenis konten yang sama
    let primaryQuery = supabase
      .from("posts")
      .select(POST_SUMMARY_SELECT)
      .eq("status", "published")
      .neq("id", params.postId)
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(3);

    if (params.categoryId) {
      primaryQuery = primaryQuery.or(
        `category_id.eq.${params.categoryId},content_type.eq.${params.contentType}`
      );
    } else {
      primaryQuery = primaryQuery.eq("content_type", params.contentType);
    }

    const { data: primaryData } = await primaryQuery;
    const primaryPosts = (primaryData ?? []) as unknown as PostSummary[];

    if (primaryPosts.length >= 3) {
      return primaryPosts.slice(0, 3);
    }

    // Lengkapi hingga 3 rekomendasi dari tulisan terbaru lain jika kurang
    const excludeIds = [params.postId, ...primaryPosts.map((p) => p.id)];
    const { data: fallbackData } = await supabase
      .from("posts")
      .select(POST_SUMMARY_SELECT)
      .eq("status", "published")
      .not("id", "in", `(${excludeIds.join(",")})`)
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(3 - primaryPosts.length);

    const fallbackPosts = (fallbackData ?? []) as unknown as PostSummary[];
    return [...primaryPosts, ...fallbackPosts];
  } catch {
    return [];
  }
}
