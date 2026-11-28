# Project Rules & AI Agent Instructions

## 1. Konteks Proyek
Ini adalah aplikasi web publikasi multi-konten (Berita, Artikel, Cerpen, Lainnya) yang minimalis dan *mobile-first*. Selalu rujuk `docs/PRD.md`, `docs/DESIGN.md`, `docs/schema.sql`, dan `docs/TASKS.md` sebelum menulis kode.

## 2. Tech Stack Wajib
- **Framework:** Next.js (App Router) + TypeScript
- **Styling:** Tailwind CSS + `@tailwindcss/typography` (untuk merender isi artikel/cerpen)
- **Database & Auth:** Supabase (`@supabase/ssr` dan `@supabase/supabase-js`)
- **Icons:** `lucide-react`
- **Rich Text Editor:** `@tiptap/react` + `@tiptap/starter-kit`
- **Theme:** `next-themes` (untuk Light/Dark mode tanpa flicker)

## 3. Aturan Arsitektur & Coding
- **Server Components by Default:** Gunakan React Server Components untuk halaman publik dan *data fetching* agar SEO optimal. Hanya tambahkan `'use client'` pada komponen interaktif (Toggle Tema, Search Bar, Tiptap Editor, Reading Progress Bar).
- **Mutasi Data:** Gunakan Next.js **Server Actions** untuk membuat, mengedit, dan menghapus konten di Dashboard Admin.
- **Keamanan:**
  - Jangan pernah mengekspos `SUPABASE_SERVICE_ROLE_KEY` ke sisi client.
  - Selalu sanitasi konten HTML sebelum dirender dengan `dangerouslySetInnerHTML` (gunakan `isomorphic-dompurify` atau `sanitize-html`).
  - Proteksi seluruh rute `/admin/*` menggunakan Next.js Middleware dan pengecekan role `admin` di server.
- **Struktur Folder:**
  - `src/app/(public)/` -> Beranda, Detail Baca (`/baca/[slug]`), Kategori.
  - `src/app/admin/` -> Dashboard Admin, Editor Tulis/Edit Post.
  - `src/components/ui/` -> Komponen kecil reusable.
  - `src/components/reading/` -> Komponen khusus halaman baca (Progress Bar, Font Size Toggle).
  - `src/lib/supabase/` -> `client.ts`, `server.ts`, `middleware.ts`.
  - `src/types/` -> TypeScript interfaces sesuai `docs/schema.sql`.

## 4. Aturan Eksekusi
- Fokus menyelesaikan **Fase 1 (MVP)** sesuai urutan di `docs/TASKS.md`. Jangan mengerjakan fitur Fase 2 (Bookmark, Like, Komentar) sebelum Fase 1 selesai dan diverifikasi.
- Kerjakan satu Milestone pada satu waktu. Setelah selesai satu Milestone, berikan ringkasan perubahan dan tunggu konfirmasi pengguna.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
