import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getAdminSession } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/posts";
import { LoginForm } from "@/app/login/LoginForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Masuk Redaksi",
  description: "Halaman masuk pengelola konten Aksara.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const session = await getAdminSession();
  if (session) {
    redirect("/admin");
  }

  const params = await searchParams;
  const nextPath = params.next?.startsWith("/admin") ? params.next : "/admin";
  const initialError =
    params.error === "unconfigured" || !isSupabaseConfigured()
      ? "Koneksi Supabase belum dikonfigurasi pada .env.local."
      : null;

  return (
    <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-12 sm:py-16">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>

      <section className="rounded-xl border border-border bg-surface p-6 sm:p-8">
        <div className="mb-6 space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Masuk Redaksi
          </h1>
          <p className="text-sm text-muted">
            Gunakan akun admin terdaftar untuk mengelola tulisan dan publikasi.
          </p>
        </div>

        <LoginForm nextPath={nextPath} initialError={initialError} />
      </section>
    </div>
  );
}
