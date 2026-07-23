# HealthScan

Aplikasi skrining mandiri risiko kesehatan gaya hidup & pekerjaan, dengan panel admin
untuk melihat data responden. Dibuat untuk keperluan tugas kuliah program studi Keperawatan.

Proyek ini terdiri dari dua bagian yang berjalan terpisah:

- **`frontend/`** — React + Vite (wizard skrining publik + panel admin)
- **`server/`** — Node.js + Express + SQLite (API, penyimpanan data, autentikasi admin)

Kenapa perlu backend? Karena admin harus bisa melihat jawaban responden setelah mereka
submit, data harus disimpan di suatu tempat (server + database), bukan cuma di memori
browser masing-masing responden.

---

## 1. Menjalankan Backend (server)

```bash
cd server
npm install
cp .env.example .env
```

Buka file `.env` lalu isi:
- `JWT_SECRET` — string acak panjang (boleh generate dengan `openssl rand -hex 32`)
- `ADMIN_USERNAME` dan `ADMIN_PASSWORD` — kredensial admin awal (password minimal 8 karakter, sebaiknya lebih panjang & acak)

Lalu buat akun admin pertama dan jalankan server:

```bash
npm run seed
npm start
```

Server akan berjalan di `http://localhost:4000`. Database SQLite (`healthscan.db`) akan
otomatis terbuat di folder `server/` saat server pertama kali dijalankan.

## 2. Menjalankan Frontend

Buka terminal baru:

```bash
cd frontend
npm install
npm run dev
```

Buka `http://localhost:5173` di browser — ini halaman wizard skrining untuk responden.

Panel admin ada di `http://localhost:5173/admin/login` — login dengan `ADMIN_USERNAME` /
`ADMIN_PASSWORD` yang tadi diseed di backend.

> Jika backend dijalankan di alamat/port lain, buat file `frontend/.env` berisi:
> `VITE_API_URL=http://alamat-backend-anda/api`

## 3. Alur Penggunaan

1. Responden mengisi wizard 5 langkah di halaman utama (Data Diri → Gaya Hidup →
   Gejala → Hasil → Rekomendasi).
2. Saat responden meninggalkan layar "Hasil Skrining", jawaban lengkap dan skor
   (dihitung ulang di server, bukan hanya percaya perhitungan di browser) disimpan
   ke database.
3. Admin login di `/admin/login`, lalu melihat seluruh responden di
   `/admin/dashboard`, klik satu baris untuk melihat detail jawaban lengkap, atau
   mengekspor semua data sebagai CSV.

## 4. Struktur Proyek

```
healthscan/
  frontend/
    src/
      components/   (DataDiri, GayaHidup, Gejala, Hasil, Rekomendasi, FacilityMap, dst.)
      admin/         (AdminLogin, AdminDashboard, AdminRespondentDetail)
      data/           (facilities.js, symptoms.js)
      scoring.js      (mesin skor — mirror dari server/scoring.js)
      api.js
      App.jsx
      main.jsx
      index.css
  server/
    routes/           (submissions.js, admin.js)
    middleware/auth.js
    db.js
    scoring.js        (mesin skor — sumber kebenaran, dihitung ulang di server)
    index.js
    seed.js
  PRIVACY.md
```

## 5. Keamanan yang Sudah Diterapkan

- Password admin di-hash dengan bcrypt (tidak pernah disimpan/di-log dalam bentuk teks biasa).
- Sesi admin memakai JWT yang disimpan di cookie **httpOnly** (bukan localStorage), dengan `sameSite=strict` dan masa berlaku 2 jam.
- Semua endpoint `/api/admin/*` (kecuali `/login`) wajib melewati verifikasi token.
- Validasi ketat di server untuk setiap field yang dikirim publik lewat `POST /api/submissions` — payload yang tidak sesuai ditolak (400), bukan disimpan mentah-mentah.
- Skor risiko selalu dihitung ulang di server (server tidak pernah mempercayai skor kiriman klien).
- Rate limiting pada endpoint login admin (maks. 5 percobaan / 15 menit) dan pada seluruh API secara umum.
- HTTP security headers via `helmet`.
- CORS dibatasi hanya ke origin frontend yang dikonfigurasi.
- Query database memakai parameterized statement (`better-sqlite3` prepared statements) — bukan penggabungan string SQL.
- Checkbox persetujuan (consent) wajib dicentang responden sebelum data bisa dikirim.

Lihat `PRIVACY.md` untuk catatan lebih lanjut soal batasan proyek ini sebagai prototipe tugas kuliah.

## 6. Deploy (opsional)

Karena sekarang ada backend, aplikasi ini **tidak lagi bisa di-deploy sebagai static
site murni** di Vercel/Netlify. Opsi yang wajar untuk demo/tugas:

- **Backend**: Render, Railway, atau Fly.io (set environment variables sesuai `.env.example`, `NODE_ENV=production`).
- **Frontend**: Vercel/Netlify seperti biasa, dengan `VITE_API_URL` diarahkan ke URL backend yang sudah dideploy.
- Alternatif paling sederhana untuk demo lokal/offline: jalankan `npm run build` di `frontend/`, lalu serve folder `dist/` dari server Express yang sama dengan API (butuh sedikit konfigurasi tambahan `express.static`).
