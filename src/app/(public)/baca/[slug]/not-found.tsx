import Link from "next/link";
import { ArrowLeft, FileQuestion } from "lucide-react";

export default function PostNotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center justify-center px-4 py-20 text-center">
      <FileQuestion className="h-10 w-10 text-muted" aria-hidden="true" />
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
        Tulisan tidak ditemukan
      </h1>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
        Tulisan yang kamu cari mungkin sudah dipindahkan, diarsipkan, atau tautan yang dibuka tidak valid.
      </p>
      <div className="mt-6">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-accent px-5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>
    </div>
  );
}
