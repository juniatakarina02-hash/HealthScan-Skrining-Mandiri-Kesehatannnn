// Jalankan sekali di awal: `npm run seed`
// Membuat akun admin pertama dari ADMIN_USERNAME / ADMIN_PASSWORD di .env
// Aman dijalankan berulang — jika username sudah ada, password akan di-update.

import "dotenv/config";
import bcrypt from "bcryptjs";
import { db } from "./db.js";

const username = process.env.ADMIN_USERNAME;
const password = process.env.ADMIN_PASSWORD;

if (!username || !password) {
  console.error("[FATAL] ADMIN_USERNAME dan ADMIN_PASSWORD wajib diset di file .env sebelum seeding.");
  process.exit(1);
}

if (password.length < 8) {
  console.error("[FATAL] ADMIN_PASSWORD terlalu pendek — gunakan minimal 8 karakter, idealnya lebih panjang & acak.");
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 12);

const existing = db.prepare("SELECT id FROM admin_user WHERE username = ?").get(username);

if (existing) {
  db.prepare("UPDATE admin_user SET password_hash = ? WHERE username = ?").run(hash, username);
  console.log(`Password admin "${username}" berhasil diperbarui.`);
} else {
  db.prepare("INSERT INTO admin_user (username, password_hash) VALUES (?, ?)").run(username, hash);
  console.log(`Akun admin "${username}" berhasil dibuat.`);
}
