import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/posts";
import type { Profile } from "@/types/database";

export async function getAdminSession(): Promise<{
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
  profile: Profile;
} | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return null;
  }

  return {
    supabase,
    userId: user.id,
    profile,
  };
}

/**
 * Memastikan request berasal dari pengguna terautentikasi dengan role 'admin'.
 * Mengarahkan ke /login jika belum masuk atau ke / jika bukan admin.
 */
export async function requireAdmin() {
  if (!isSupabaseConfigured()) {
    redirect("/login?error=unconfigured");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/");
  }

  return {
    supabase,
    userId: user.id,
    profile,
  };
}
