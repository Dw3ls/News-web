"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Menu, Search, X } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const NAV_ITEMS = [
  { label: "Beranda", href: "/", type: null },
  { label: "Berita", href: "/?type=berita", type: "berita" },
  { label: "Artikel", href: "/?type=artikel", type: "artikel" },
  { label: "Cerpen", href: "/?type=cerpen", type: "cerpen" },
  { label: "Lainnya", href: "/?type=lainnya", type: "lainnya" },
] as const;

function NavLinks({
  isOpen,
  onNavigate,
}: {
  isOpen: boolean;
  onNavigate: () => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentType = searchParams.get("type");

  return (
    <ul
      id="primary-navigation-list"
      className={`${
        isOpen ? "flex" : "hidden"
      } absolute inset-x-0 top-14 z-40 flex-col border-b border-border bg-surface px-4 py-3 md:static md:flex md:flex-row md:items-center md:gap-1 md:border-0 md:bg-transparent md:p-0`}
    >
      {NAV_ITEMS.map((item) => {
        const isCurrent =
          pathname === "/" &&
          (item.type === null ? !currentType : currentType === item.type);

        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={isCurrent ? "page" : undefined}
              className={`flex min-h-11 items-center rounded-md px-3 text-sm transition-colors ${
                isCurrent
                  ? "border-l-2 border-accent bg-background font-semibold text-accent md:border-l-0 md:bg-transparent md:underline md:decoration-2 md:underline-offset-8"
                  : "text-muted hover:bg-background hover:text-foreground md:hover:bg-transparent"
              }`}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function SearchBar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const currentQuery = searchParams.get("q") ?? "";

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const trimmed = String(formData.get("q") ?? "").trim();
    if (trimmed) {
      router.push(`/?q=${encodeURIComponent(trimmed)}`);
    } else {
      router.push("/");
    }
    onClose();
  };

  return (
    <div className="border-b border-border bg-surface">
      <form
        onSubmit={handleSubmit}
        role="search"
        aria-label="Pencarian tulisan"
        className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-2.5"
      >
        <label htmlFor="header-search-input" className="sr-only">
          Cari berita, artikel, atau cerpen
        </label>
        <input
          key={currentQuery}
          ref={inputRef}
          id="header-search-input"
          name="q"
          type="search"
          defaultValue={currentQuery}
          placeholder="Cari berita, artikel, atau cerpen..."
          className="min-h-11 flex-1 rounded-md border border-input-border bg-background px-3 text-sm text-foreground placeholder:text-muted"
        />
        <button
          type="submit"
          className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-md bg-accent px-4 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
        >
          Cari
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup pencarian"
          className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-md text-muted transition-colors hover:bg-background hover:text-foreground"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}

/**
 * Header sticky minimalis & mobile-first (tinggi 56px / h-14).
 * Seluruh kontrol interaktif memiliki tap target minimal 44x44px.
 */
export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isMenuOpen) {
          setIsMenuOpen(false);
          menuButtonRef.current?.focus();
        }
        if (isSearchOpen) {
          setIsSearchOpen(false);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen, isSearchOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur-sm">
      <a href="#main-content" className="skip-link">
        Lewati ke konten utama
      </a>

      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-2 px-4">
        {/* Logo kiri */}
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-2 font-serif text-xl font-bold tracking-tight text-foreground"
        >
          <span>Aksara</span>
        </Link>

        {/* Navigasi utama (inline di desktop, dropdown di mobile) */}
        <nav aria-label="Utama" className="flex items-center">
          <Suspense fallback={null}>
            <NavLinks
              isOpen={isMenuOpen}
              onNavigate={() => setIsMenuOpen(false)}
            />
          </Suspense>
        </nav>

        {/* Kontrol aksi kanan: Cari, Toggle Dark Mode, Menu Mobile */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setIsSearchOpen((prev) => !prev);
              setIsMenuOpen(false);
            }}
            aria-expanded={isSearchOpen}
            aria-label={isSearchOpen ? "Tutup kolom cari" : "Buka kolom cari"}
            className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-md text-muted transition-colors hover:bg-background hover:text-foreground"
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </button>

          <ThemeToggle />

          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => {
              setIsMenuOpen((prev) => !prev);
              setIsSearchOpen(false);
            }}
            aria-expanded={isMenuOpen}
            aria-controls="primary-navigation-list"
            aria-label={isMenuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
            className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-md text-muted transition-colors hover:bg-background hover:text-foreground md:hidden"
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      <Suspense fallback={null}>
        <SearchBar
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
        />
      </Suspense>
    </header>
  );
}
