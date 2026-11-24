# Design System & UI/UX Guidelines

## 1. Filosofi Visual
- **Editorial Minimalis:** Fokus utama adalah teks dan keterbacaan. Gunakan *whitespace* yang lega, hindari bayangan (*drop shadow*) yang berat, dan gunakan garis tipis (*subtle border*) sebagai pemisah antar elemen.
- **Mobile-First:** Semua komponen dirancang untuk layar ponsel (360px–430px) terlebih dahulu, lalu diperluas secara proporsional ke tablet dan desktop.

## 2. Palet Warna (Low-Saturation)
Gunakan CSS variables / Tailwind config agar *Light Mode* dan *Dark Mode* transisi dengan mulus:

### Light Mode
- **Background Utama:** `#FAFAFA` (Putih lembut, tidak menyilaukan)
- **Surface / Card:** `#FFFFFF`
- **Teks Utama:** `#18181B` (Zinc 900)
- **Teks Sekunder / Meta:** `#52525B` (Zinc 600)
- **Border:** `#E4E4E7` (Zinc 200)
- **Aksen Utama:** `#2C5282` (Muted Slate Blue)

### Dark Mode
- **Background Utama:** `#0F1115` (Charcoal gelap)
- **Surface / Card:** `#181B20`
- **Teks Utama:** `#F4F4F5` (Zinc 100)
- **Teks Sekunder / Meta:** `#A1A1AA` (Zinc 400)
- **Border:** `#27272A` (Zinc 800)
- **Aksen Utama:** `#63B3ED` (Soft Sky Blue)

## 3. Tipografi
- **UI, Berita & Artikel:** `Plus Jakarta Sans` atau `Inter` (Sans-serif, bersih dan modern).
- **Cerpen / Fiksi:** `Lora` atau `Newsreader` (Serif, memberi nuansa membaca buku).
- **Skala Bacaan (Halaman Detail):**
  - Lebar maksimal kolom teks: `max-w-2xl` (~65 karakter per baris).
  - Ukuran teks isi (default): `16px`–`18px` (`text-base` di mobile, `text-lg` di desktop).
  - Jarak antar baris (*line-height*): `1.75` (`leading-relaxed` / `leading-loose` untuk cerpen).

## 4. Aturan Komponen & Mobile-Friendly
- **Tap Target:** Semua tombol, tautan navigasi, dan tab filter wajib memiliki area sentuh minimal `44x44px`.
- **Header:** Sticky header tipis (`h-14` / `56px`) berisi Logo di kiri, serta tombol Cari, Toggle Dark Mode, dan Menu di kanan.
- **Filter Jenis Konten:** Gunakan *horizontal scrollable pills* (`Semua`, `Berita`, `Artikel`, `Cerpen`, `Lainnya`) tepat di bawah header pada halaman Beranda agar mudah digeser dengan jempol.
- **Reading Progress Bar:** Garis tipis setinggi `2px`–`3px` di paling atas layar (warna aksen) yang mengikuti progres gulir pembaca di halaman detail.
- **Kontrol Ukuran Font:** Di halaman detail (khususnya Cerpen/Artikel), sediakan tombol ringkas `A-` / `A+` untuk menyesuaikan ukuran huruf.
