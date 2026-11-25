import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { PostEditorForm } from "@/components/admin/PostEditorForm";
import type { Category, Post } from "@/types/database";

export const metadata: Metadata = {
  title: "Editor Tulisan",
};

export default async function AdminEditorPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { supabase } = await requireAdmin();
  const { id } = await searchParams;

  const { data: categoriesData } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  const categories = (categoriesData ?? []) as Category[];
  let initialPost: Post | null = null;

  if (id) {
    const { data: postData } = await supabase
      .from("posts")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!postData) {
      notFound();
    }

    initialPost = postData as Post;
  }

  return (
    <PostEditorForm
      initialPost={initialPost}
      initialCategories={categories}
    />
  );
}
