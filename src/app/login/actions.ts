"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/posts";

export interface LoginActionState {
  error: string | null;
}

export async function loginAction(
  _prevState: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  if (!isSupabaseConfigured()) {
    return {
      error:
        "Koneksi Supabase belum dikonfigurasi pada berkas .env.local.",
    };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const nextPath = String(formData.get("next") ?? "/admin");

  if (!email || !password) {
    return {
      error: "Email dan kata sandi wajib diisi.",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return {
      error: "Email atau kata sandi salah. Silakan periksa kembali.",
    };
  }

  // Pastikan akun memiliki role 'admin' pada tabel profiles
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    await supabase.auth.signOut();
    return {
      error:
        "Akun ini belum memiliki hak akses Admin. Ubah kolom role menjadi 'admin' di Supabase.",
    };
  }

  const safeDestination =
    nextPath.startsWith("/admin") && !nextPath.startsWith("//")
      ? nextPath
      : "/admin";

  revalidatePath("/", "layout");
  redirect(safeDestination);
}

export async function logoutAction() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  revalidatePath("/", "layout");
  redirect("/login");
}
