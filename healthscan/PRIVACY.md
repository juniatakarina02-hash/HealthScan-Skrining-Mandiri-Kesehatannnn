# Catatan Privasi & Batasan

HealthScan adalah **prototipe untuk tugas kuliah**, bukan sistem informasi kesehatan
tingkat produksi. Sebelum dipakai untuk mengumpulkan data sungguhan dari orang lain,
perhatikan hal berikut:

- Aplikasi ini menyimpan data pribadi (nama, usia, tempat tinggal, pekerjaan) dan
  data terkait kesehatan (gaya hidup, gejala). Pastikan responden memberi persetujuan
  (consent) secara sadar — sudah difasilitasi lewat checkbox wajib di layar "Data Diri".
- Data disimpan di file SQLite lokal (`server/healthscan.db`). File ini **tidak
  terenkripsi secara otomatis** — keamanan penyimpanan bergantung pada keamanan
  server/komputer tempat file ini berada. Jangan commit file `.db` ke Git/repo publik.
- Akses ke data responden dibatasi lewat login admin (JWT + cookie httpOnly), tetapi
  ini tetap satu akun admin tunggal, bukan sistem manajemen peran (role-based access)
  yang lengkap.
- Skor risiko dihasilkan dari bobot yang **ilustratif/placeholder**, belum tervalidasi
  secara klinis — lihat komentar di `scoring.js`.
- Jika proyek ini dikembangkan lebih lanjut untuk penggunaan nyata (di luar tugas
  kuliah), pertimbangkan: enkripsi data saat disimpan (encryption at rest), kebijakan
  retensi/penghapusan data, audit log akses admin, serta tinjauan etik terkait
  pengumpulan data kesehatan.
