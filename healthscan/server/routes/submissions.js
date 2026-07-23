import { Router } from "express";
import { db } from "../db.js";
import { hitungSkorLengkap, DOMAIN_LABEL } from "../scoring.js";

const router = Router();

const JENIS_KELAMIN_VALID = ["laki-laki", "perempuan"];
const ENUM_GARAM = ["rendah", "sedang", "tinggi"];
const ENUM_TIDUR_KUALITAS = ["baik", "cukup", "buruk"];
const ENUM_FREK_LEMAK = ["jarang", "kadang", "sering"];
const ENUM_OLAHRAGA = ["jarang", "sedang", "rutin"];
const ENUM_POSTUR = ["baik", "buruk"];
const ENUM_ALKOHOL = ["tidak", "kadang", "sering"];
const ENUM_MEROKOK = ["tidak", "pasif", "aktif"];
const ENUM_STRES = ["ringan", "sedang", "berat"];
const ENUM_KEPARAHAN = ["ringan", "sedang", "berat"];
const ENUM_FREKUENSI_GEJALA = ["baru_pertama_kali", "hilang_timbul", "hampir_tiap_hari"];

function isNonEmptyString(v, maxLen = 300) {
  return typeof v === "string" && v.trim().length > 0 && v.length <= maxLen;
}

function isNumberInRange(v, min, max) {
  return typeof v === "number" && Number.isFinite(v) && v >= min && v <= max;
}

// Validasi ketat di server — jangan pernah percaya validasi client saja.
function validatePayload(body) {
  const errors = [];

  if (!body.consent) errors.push("Persetujuan penyimpanan data (consent) wajib dicentang.");
  if (!isNonEmptyString(body.nama, 150)) errors.push("Nama tidak valid.");
  if (!isNumberInRange(body.usia, 10, 120)) errors.push("Usia tidak valid.");
  if (!JENIS_KELAMIN_VALID.includes(body.jenisKelamin)) errors.push("Jenis kelamin tidak valid.");
  if (!isNonEmptyString(body.tempatTinggal, 150)) errors.push("Tempat tinggal tidak valid.");
  if (!isNonEmptyString(body.pekerjaan, 150)) errors.push("Pekerjaan tidak valid.");

  const gh = body.gayaHidup || {};
  if (!ENUM_GARAM.includes(gh.garam)) errors.push("Konsumsi garam tidak valid.");
  if (!isNumberInRange(gh.tidurDurasiJam, 0, 24)) errors.push("Durasi tidur tidak valid.");
  if (!ENUM_TIDUR_KUALITAS.includes(gh.tidurKualitas)) errors.push("Kualitas tidur tidak valid.");
  if (!ENUM_FREK_LEMAK.includes(gh.makanFrekuensiLemak)) errors.push("Frekuensi makanan berlemak tidak valid.");
  if (typeof gh.makanTeratur !== "boolean") errors.push("Keteraturan makan tidak valid.");
  if (!ENUM_OLAHRAGA.includes(gh.olahragaFrekuensi)) errors.push("Frekuensi olahraga tidak valid.");
  if (!isNumberInRange(gh.dudukJamPerHari, 0, 24)) errors.push("Durasi duduk tidak valid.");
  if (typeof gh.dudukAdaJeda !== "boolean") errors.push("Info jeda duduk tidak valid.");
  if (!ENUM_POSTUR.includes(gh.dudukPostur)) errors.push("Postur duduk tidak valid.");
  if (!ENUM_ALKOHOL.includes(gh.alkohol)) errors.push("Konsumsi alkohol tidak valid.");
  if (!ENUM_MEROKOK.includes(gh.merokok)) errors.push("Status merokok tidak valid.");
  if (!ENUM_STRES.includes(gh.stresKerja)) errors.push("Tingkat stres kerja tidak valid.");
  if (!Array.isArray(gh.riwayatKeluarga)) errors.push("Riwayat keluarga tidak valid.");
  if (!isNumberInRange(gh.beratKg, 20, 300)) errors.push("Berat badan tidak valid.");
  if (!isNumberInRange(gh.tinggiCm, 100, 250)) errors.push("Tinggi badan tidak valid.");
  if (!isNumberInRange(gh.kafeinCangkirPerHari, 0, 20)) errors.push("Konsumsi kafein tidak valid.");

  const gejala = Array.isArray(body.gejala) ? body.gejala : [];
  for (const g of gejala) {
    if (!isNonEmptyString(g.id, 50)) errors.push("ID gejala tidak valid.");
    if (!ENUM_FREKUENSI_GEJALA.includes(g.frekuensi)) errors.push(`Frekuensi gejala "${g.id}" tidak valid.`);
    if (!ENUM_KEPARAHAN.includes(g.keparahan)) errors.push(`Keparahan gejala "${g.id}" tidak valid.`);
    if (!isNonEmptyString(g.pencetus, 100)) errors.push(`Faktor pencetus gejala "${g.id}" tidak valid.`);
  }

  return errors;
}

// POST /api/submissions — publik, tanpa auth. Menyimpan satu hasil skrining.
router.post("/", (req, res) => {
  const body = req.body || {};
  const errors = validatePayload(body);
  if (errors.length > 0) {
    return res.status(400).json({ error: "Data tidak valid.", details: errors });
  }

  // Skor SELALU dihitung ulang di server, tidak pernah memakai skor kiriman klien.
  const { bmi, skorTotal, label, domainDominan } = hitungSkorLengkap({
    gayaHidup: body.gayaHidup,
    gejala: body.gejala,
  });

  const stmt = db.prepare(`
    INSERT INTO submission (
      nama, usia, jenis_kelamin, tempat_tinggal, pekerjaan,
      gaya_hidup_json, gejala_json, bmi,
      skor_kardio, skor_musculo, skor_pencernaan, skor_mental,
      label_kardio, label_musculo, label_pencernaan, label_mental,
      domain_dominan
    ) VALUES (
      @nama, @usia, @jenisKelamin, @tempatTinggal, @pekerjaan,
      @gayaHidupJson, @gejalaJson, @bmi,
      @skorKardio, @skorMusculo, @skorPencernaan, @skorMental,
      @labelKardio, @labelMusculo, @labelPencernaan, @labelMental,
      @domainDominan
    )
  `);

  const info = stmt.run({
    nama: body.nama.trim(),
    usia: body.usia,
    jenisKelamin: body.jenisKelamin,
    tempatTinggal: body.tempatTinggal.trim(),
    pekerjaan: body.pekerjaan.trim(),
    gayaHidupJson: JSON.stringify(body.gayaHidup),
    gejalaJson: JSON.stringify(body.gejala || []),
    bmi,
    skorKardio: skorTotal.kardiovaskular,
    skorMusculo: skorTotal.muskuloskeletal,
    skorPencernaan: skorTotal.pencernaan,
    skorMental: skorTotal.mental,
    labelKardio: label.kardiovaskular,
    labelMusculo: label.muskuloskeletal,
    labelPencernaan: label.pencernaan,
    labelMental: label.mental,
    domainDominan,
  });

  res.status(201).json({
    id: info.lastInsertRowid,
    bmi,
    skor: skorTotal,
    label,
    domainDominan,
    domainDominanLabel: DOMAIN_LABEL[domainDominan],
  });
});

export default router;
