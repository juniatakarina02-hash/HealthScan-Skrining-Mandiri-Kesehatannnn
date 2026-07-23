import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import submissionsRouter from "./routes/submissions.js";
import adminRouter from "./routes/admin.js";

const app = express();
const PORT = process.env.PORT || 4000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

app.use(helmet());
app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true, // wajib agar cookie httpOnly admin bisa terkirim
  })
);
app.use(express.json({ limit: "200kb" }));
app.use(cookieParser());

// Rate limit umum untuk seluruh API sebagai lapisan tambahan (di luar limiter khusus login)
app.use(
  "/api/",
  rateLimit({
    windowMs: 60 * 1000,
    limit: 60,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/submissions", submissionsRouter);
app.use("/api/admin", adminRouter);

// Handler error terakhir — jangan pernah bocorkan stack trace ke klien
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Terjadi kesalahan pada server." });
});

app.listen(PORT, () => {
  console.log(`HealthScan API berjalan di http://localhost:${PORT}`);
});
