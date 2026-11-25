import Link from "next/link";

const FOOTER_LINKS = [
  { label: "Beranda", href: "/" },
  { label: "Berita", href: "/?type=berita" },
  { label: "Artikel", href: "/?type=artikel" },
  { label: "Cerpen", href: "/?type=cerpen" },
  { label: "Lainnya", href: "/?type=lainnya" },
];

/**
 * Footer editorial minimalis dengan garis pemisah tipis dan tautan ramah sentuh.
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center font-serif text-lg font-bold tracking-tight text-foreground"
          >
            Aksara
          </Link>
          <p className="text-sm text-muted">
            Ruang baca berita, artikel informatif, dan karya fiksi tanpa distraksi.
          </p>
        </div>

        <nav aria-label="Footer">
          <ul className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {FOOTER_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-11 items-center px-2 text-sm text-muted transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 text-xs text-muted">
          <p>&copy; {currentYear} Aksara. Seluruh hak cipta dilindungi.</p>
          <Link
            href="/login"
            className="inline-flex min-h-11 items-center px-2 transition-colors hover:text-foreground"
          >
            Redaksi
          </Link>
        </div>
      </div>
    </footer>
  );
}
