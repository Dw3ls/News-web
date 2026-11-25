import type { MetadataRoute } from "next";
import { isSupabaseConfigured } from "@/lib/posts";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aksara.id";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  if (!isSupabaseConfigured()) {
    return staticRoutes;
  }

  try {
    // Dynamic import to avoid bundling Supabase client when not configured
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    const { data: posts } = await supabase
      .from("posts")
      .select("slug, updated_at, published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false, nullsFirst: false });

    const postRoutes: MetadataRoute.Sitemap = (posts ?? []).map((post) => ({
      url: `${SITE_URL}/baca/${post.slug}`,
      lastModified: new Date(post.updated_at ?? post.published_at ?? Date.now()),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    return [...staticRoutes, ...postRoutes];
  } catch {
    return staticRoutes;
  }
}
