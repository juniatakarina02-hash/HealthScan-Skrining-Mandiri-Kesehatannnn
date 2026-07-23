import { Router } from "express";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import { db } from "../db.js";
import { requireAdminAuth, signAdminToken, JWT_COOKIE_NAME } from "../middleware/auth.js";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Terlalu banyak percobaan login. Coba lagi beberapa menit lagi." },
});

// POST /api/admin/login
router.post("/login", loginLimiter, (req, res) => {
  const { username, password } = req.body || {};
  if (typeof username !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "Username dan password wajib diisi." });
  }

  const user = db.prepare("SELECT * FROM admin_user WHERE username = ?").get(username.trim());

  // Pesan error generik — tidak membocorkan apakah username atau password yang salah.
  const genericError = () => res.status(401).json({ error: "Username atau password salah." });

  if (!user) return genericError();

  const valid = bcrypt.compareSync(password, user.password_hash);
  if (!valid) return genericError();

  const token = signAdminToken({ sub: user.id, username: user.username });

  res.cookie(JWT_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 2 * 60 * 60 * 1000, // 2 jam, selaras dengan JWT_EXPIRES_IN
  });

  res.json({ ok: true, username: user.username });
});

// POST /api/admin/logout
router.post("/logout", (req, res) => {
  res.clearCookie(JWT_COOKIE_NAME);
  res.json({ ok: true });
});

// GET /api/admin/me — cek sesi aktif (dipakai frontend saat load dashboard)
router.get("/me", requireAdminAuth, (req, res) => {
  res.json({ username: req.admin.username });
});

// GET /api/admin/submissions — daftar semua responden (ringkas)
router.get("/submissions", requireAdminAuth, (req, res) => {
  const rows = db
    .prepare(
      `SELECT id, created_at, nama, usia, jenis_kelamin, tempat_tinggal,
              domain_dominan, label_kardio, label_musculo, label_pencernaan, label_mental
       FROM submission ORDER BY created_at DESC`
    )
    .all();
  res.json(rows);
});

// GET /api/admin/submissions/:id — detail lengkap satu responden
router.get("/submissions/:id", requireAdminAuth, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: "ID tidak valid." });

  const row = db.prepare("SELECT * FROM submission WHERE id = ?").get(id);
  if (!row) return res.status(404).json({ error: "Data responden tidak ditemukan." });

  res.json({
    ...row,
    gayaHidup: JSON.parse(row.gaya_hidup_json),
    gejala: JSON.parse(row.gejala_json),
  });
});

// GET /api/admin/submissions/export/csv — unduh seluruh data sebagai CSV
router.get("/submissions/export/csv", requireAdminAuth, (req, res) => {
  const rows = db.prepare("SELECT * FROM submission ORDER BY created_at DESC").all();

  const header = [
    "id", "created_at", "nama", "usia", "jenis_kelamin", "tempat_tinggal", "pekerjaan",
    "bmi", "skor_kardio", "skor_musculo", "skor_pencernaan", "skor_mental",
    "label_kardio", "label_musculo", "label_pencernaan", "label_mental", "domain_dominan",
  ];

  const escapeCsv = (val) => {
    const s = String(val ?? "");
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const lines = [header.join(",")];
  for (const r of rows) {
    lines.push(header.map((h) => escapeCsv(r[h])).join(","));
  }

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", "attachment; filename=healthscan_responden.csv");
  res.send(lines.join("\n"));
});

export default router;
