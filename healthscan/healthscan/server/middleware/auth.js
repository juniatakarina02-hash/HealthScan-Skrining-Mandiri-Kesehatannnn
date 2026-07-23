import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error(
    "[FATAL] JWT_SECRET tidak diset di .env — server tidak boleh berjalan tanpa ini."
  );
  process.exit(1);
}

export const JWT_COOKIE_NAME = "healthscan_admin_token";
export const JWT_EXPIRES_IN = "2h";

export function signAdminToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Middleware: memverifikasi cookie httpOnly berisi JWT admin.
// Tidak pernah membaca token dari header/localStorage — hanya dari cookie.
export function requireAdminAuth(req, res, next) {
  const token = req.cookies?.[JWT_COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ error: "Belum login. Silakan login sebagai admin." });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Sesi tidak valid atau sudah kedaluwarsa. Silakan login kembali." });
  }
}
