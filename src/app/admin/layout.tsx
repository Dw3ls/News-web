import Link from "next/link";
import { ExternalLink, FilePlus2, LayoutDashboard, LogOut } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { logoutAction } from "@/app/login/actions";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireAdmin();

  return (
    <div className="min-h-full bg-background">
      {/* Sub-header khusus Dashboard Admin */}
      <div className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <Link
              href="/admin"
              className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold text-foreground transition-colors hover:bg-background"
            >
              <LayoutDashboard className="h-4 w-4 text-accent" aria-hidden="true" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/admin/editor"
              className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-medium text-muted transition-colors hover:bg-background hover:text-foreground"
            >
              <FilePlus2 className="h-4 w-4" aria-hidden="true" />
              <span>Tulis Baru</span>
            </Link>

            <Link
              href="/"
              className="inline-flex min-h-11 items-center gap-1.5 rounded-md px-3 text-sm text-muted transition-colors hover:bg-background hover:text-foreground"
            >
              <span>Lihat Situs</span>
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted sm:inline">
              Masuk sebagai <strong className="text-foreground">{profile.full_name}</strong>
            </span>
            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-md border border-border bg-background px-3 text-sm font-medium text-muted transition-colors hover:text-foreground"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                <span>Keluar</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8">{children}</div>
    </div>
  );
}
