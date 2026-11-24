# Implementation Plan — Fase 1 (MVP)

## Milestone 1: Setup Proyek & Integrasi Supabase
- [x] Inisialisasi Next.js (App Router, TypeScript, Tailwind CSS) & install dependensi (`@supabase/ssr`, `@supabase/supabase-js`, `lucide-react`, `next-themes`, `@tailwindcss/typography`).
- [x] Konfigurasi `next.config.ts` (izin domain gambar Supabase Storage).
- [x] Buat helper Supabase (`src/lib/supabase/client.ts`, `server.ts`, dan `middleware.ts`).
- [x] Definisikan tipe TypeScript di `src/types/database.ts` sesuai `docs/schema.sql`.

## Milestone 2: Layout Utama, Tema & Navigasi (Mobile-First)
- [ ] Konfigurasi font (`Plus Jakarta Sans` & `Lora`) di `src/app/layout.tsx` serta warna sesuai `docs/DESIGN.md`.
- [ ] Pasang `ThemeProvider` (`next-themes`) dan komponen tombol *Light/Dark Mode*.
- [ ] Buat komponen `Header` (minimalis, sticky, mobile-friendly) dan `Footer` sederhana.

## Milestone 3: Halaman Publik (Beranda & Eksplorasi)
- [ ] Buat Halaman Beranda (`/`) dengan bagian:
  - *Featured Post* (1 tulisan pilihan).
  - Tab filter horizontal berdasarkan `content_type` (`Semua`, `Berita`, `Artikel`, `Cerpen`, `Lainnya`).
  - Daftar kartu tulisan terbaru (judul, cuplikan singkat, badge jenis konten, tanggal/waktu baca).
- [ ] Implementasikan fitur Pencarian cepat (query `?q=...`) berdasarkan judul dan cuplikan.

## Milestone 4: Halaman Detail Baca (Reading Experience)
- [ ] Buat halaman `/baca/[slug]` dengan tampilan satu kolom (`max-w-2xl`).
- [ ] Terapkan tipografi otomatis: *Sans-serif* untuk Berita/Artikel, *Serif (`Lora`)* untuk Cerpen.
- [ ] Tambahkan `ReadingProgressBar`, estimasi waktu baca, tombol kontrol ukuran huruf (`A-` / `A+`), tombol Share (Salin Tautan & WhatsApp), serta 3 rekomendasi tulisan terkait di bagian bawah.
- [ ] Tambahkan `generateMetadata` dinamis untuk SEO & Open Graph preview.

## Milestone 5: Autentikasi & Dashboard Admin (CMS)
- [ ] Buat halaman `/login` menggunakan Supabase Auth (Email & Password).
- [ ] Proteksi rute `/admin/*` agar hanya bisa diakses pengguna dengan role `admin`.
- [ ] Buat halaman `/admin` berisi daftar seluruh tulisan (status Draft/Published) dengan tombol Buat Baru, Edit, dan Hapus.
- [ ] Buat halaman `/admin/editor` (untuk buat & edit tulisan) menggunakan **Tiptap** (Heading, Bold, Italic, Blockquote, List, Link) + input Cover Image (upload ke Supabase Storage bucket `covers`), Kategori, Jenis Konten, dan Status.

## Milestone 6: Finalisasi MVP
- [ ] Tambahkan `sitemap.ts` dan `robots.ts` dinamis.
- [ ] Uji responsivitas di viewport mobile (375px) dan desktop (1280px).
- [ ] Pastikan tidak ada error TypeScript (`npm run build`).
