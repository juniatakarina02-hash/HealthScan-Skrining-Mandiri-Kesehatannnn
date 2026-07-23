import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "healthscan.db");

export const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

// Tabel admin — hanya diisi lewat seed.js, tidak ada endpoint pendaftaran publik
db.exec(`
CREATE TABLE IF NOT EXISTS admin_user (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`);

// Tabel submission — satu baris per responden yang menyelesaikan skrining
db.exec(`
CREATE TABLE IF NOT EXISTS submission (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),

  nama TEXT NOT NULL,
  usia INTEGER NOT NULL,
  jenis_kelamin TEXT NOT NULL,
  tempat_tinggal TEXT NOT NULL,
  pekerjaan TEXT NOT NULL,

  gaya_hidup_json TEXT NOT NULL,
  gejala_json TEXT NOT NULL,

  bmi REAL,

  skor_kardio REAL NOT NULL,
  skor_musculo REAL NOT NULL,
  skor_pencernaan REAL NOT NULL,
  skor_mental REAL NOT NULL,

  label_kardio TEXT NOT NULL,
  label_musculo TEXT NOT NULL,
  label_pencernaan TEXT NOT NULL,
  label_mental TEXT NOT NULL,

  domain_dominan TEXT NOT NULL
);
`);

export default db;
