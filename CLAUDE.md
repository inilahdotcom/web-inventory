# UI/UX Web Design Rounds — INC Inventaris

Dashboard Pencatatan Inventaris Aset untuk PT. Indonesia News Center (General Affairs).

## Status
Mockup UI/UX 14 halaman + 3 layar mobile, dibangun sebagai Design Components (.dc.html) di project ini. Ini adalah artefak desain (HTML statis), bukan aplikasi yang berjalan di atas stack di bawah.

## Tech stack tujuan implementasi
- React + Vite
- TanStack (Query/Router/Table sesuai kebutuhan)
- shadcn/ui (Tailwind + Radix)

Saat handoff ke kode produksi, rujuk skill "Handoff to Claude Code" agar struktur, token, dan komponen dari mockup diterjemahkan konsisten ke stack ini.

## Sistem desain (diturunkan dari DESIGN.md)
- Font: Roobert PRO (Light 400 / Bold 600) — Regular & Medium belum tersedia sebagai web font, sementara dipetakan ke Light/Bold. Font mono: JetBrains Mono untuk kode aset.
- Warna dasar: hitam #1c1c1e (pill/CTA utama), krem #f0eee9/#f7f8fa (latar), kuning #ffd02f (wordmark & aksen nilai), pastel status: teal #c3faf5/#187574 (Bagus), kuning muda #fff8e0/#746019 (Rusak Ringan/peringatan), coral #ffc6c6/#600000 (Rusak Berat/bahaya), rose #fde0f0 (Diperbaiki), abu (Hilang/kosong).
- Radius besar (16–28px) ala kartu pastel, pill 9999px untuk badge/tombol/tab.
- Navigasi: sidebar kiri gelap yang bisa diciutkan (232px), 13 rute + grup Admin terpisah.
- Semua layar digambar dari sudut pandang peran Admin.

## Struktur file
- `00-Index.dc.html` — daftar isi/navigasi semua halaman.
- `01-Login.dc.html` … `14-Profil.dc.html` — 14 halaman utama (lebar desain 1440px).
- `Mobile.dc.html` — 3 layar mobile (390px): Dashboard, Daftar Aset (kartu), Tambah Aset.
- `Sidebar.dc.html` — komponen sidebar bersama, dipakai lewat `<dc-import name="Sidebar" active="...">`.
- `Inventaris GA - Mockup 14 Halaman.dc.html` — papan mockup semua layar berdampingan (untuk review).
- `Inventaris GA - Eksplorasi.dc.html` — eksplorasi arah desain ronde 1 (arsip keputusan awal).
- `fonts/` — RoobertPRO Light & Bold (woff/woff2).
- `publish/` — versi self-contained (font/skrip/gaya tertanam) dari setiap halaman untuk dibagikan/di-host statis.
- `uploads/` — DESIGN.md, requirements PDF, aset font asli, demo.html referensi.

## Catatan penting
- Data yang ditampilkan adalah contoh realistis dari dokumen requirements (95 aset, kode format `NNN/INC-GA/M/YY`, dll), bukan data nyata.
- Kirim `RoobertPRO-Regular.woff2` dan `RoobertPRO-Medium.woff2` bila ingin skala berat font sesuai DESIGN.md asli.
- Setelah mengubah salah satu file halaman, folder `publish/` perlu di-bundle ulang (`super_inline_html`) sebelum dibagikan lagi.

