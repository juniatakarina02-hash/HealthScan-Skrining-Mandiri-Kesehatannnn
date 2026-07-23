// ============================================================================
// scoring.js — mesin skor risiko berbasis aturan (rule-based weighted scoring)
//
// PENTING: Seluruh bobot (weight) di bawah ini adalah NILAI ILUSTRATIF /
// PLACEHOLDER untuk keperluan tugas kuliah, BUKAN bobot yang tervalidasi
// secara klinis. Jangan menyajikan angka ini sebagai hasil yang tervalidasi
// secara medis. Sesuaikan bobot & ambang batas jika ada pembimbing/dosen
// yang meminta kalibrasi berbeda.
//
// File ini SENGAJA di-mirror persis dengan frontend/src/scoring.js supaya
// server bisa menghitung ulang skor secara independen dan tidak mempercayai
// begitu saja skor yang dikirim dari klien (client-submitted score).
// ============================================================================

export const DOMAINS = {
  KARDIO: "kardiovaskular",
  MUSCULO: "muskuloskeletal",
  PENCERNAAN: "pencernaan",
  MENTAL: "mental",
};

export const DOMAIN_LABEL = {
  [DOMAINS.KARDIO]: "Kardiovaskular / Metabolik",
  [DOMAINS.MUSCULO]: "Muskuloskeletal",
  [DOMAINS.PENCERNAAN]: "Pencernaan",
  [DOMAINS.MENTAL]: "Kesehatan Mental",
};

// Ambang batas total skor per domain -> label risiko
export const THRESHOLD_LOW_MAX = 4; // skor 0 - 4   => Rendah
export const THRESHOLD_MED_MAX = 9; // skor 5 - 9   => Sedang
// skor >= 10 => Tinggi

export function scoreToLabel(score) {
  if (score <= THRESHOLD_LOW_MAX) return "Rendah";
  if (score <= THRESHOLD_MED_MAX) return "Sedang";
  return "Tinggi";
}

export function hitungBMI(beratKg, tinggiCm) {
  if (!beratKg || !tinggiCm) return null;
  const tinggiM = tinggiCm / 100;
  const bmi = beratKg / (tinggiM * tinggiM);
  return Math.round(bmi * 10) / 10;
}

// ----------------------------------------------------------------------------
// Bobot variabel gaya hidup & pekerjaan per domain
// ----------------------------------------------------------------------------
function skorGayaHidup(gh) {
  const skor = {
    [DOMAINS.KARDIO]: 0,
    [DOMAINS.MUSCULO]: 0,
    [DOMAINS.PENCERNAAN]: 0,
    [DOMAINS.MENTAL]: 0,
  };

  // Konsumsi garam
  if (gh.garam === "tinggi") skor[DOMAINS.KARDIO] += 2;
  else if (gh.garam === "sedang") skor[DOMAINS.KARDIO] += 1;

  // Pola tidur
  if (gh.tidurDurasiJam !== undefined && gh.tidurDurasiJam < 6) {
    skor[DOMAINS.KARDIO] += 1;
    skor[DOMAINS.MENTAL] += 1;
  }
  if (gh.tidurKualitas === "buruk") {
    skor[DOMAINS.MENTAL] += 2;
  } else if (gh.tidurKualitas === "cukup") {
    skor[DOMAINS.MENTAL] += 1;
  }

  // Pola makan
  if (gh.makanFrekuensiLemak === "sering") {
    skor[DOMAINS.KARDIO] += 2;
    skor[DOMAINS.PENCERNAAN] += 1;
  } else if (gh.makanFrekuensiLemak === "kadang") {
    skor[DOMAINS.KARDIO] += 1;
  }
  if (gh.makanTeratur === false) {
    skor[DOMAINS.PENCERNAAN] += 2;
  }

  // Aktivitas fisik
  if (gh.olahragaFrekuensi === "jarang") {
    skor[DOMAINS.KARDIO] += 2;
    skor[DOMAINS.MUSCULO] += 1;
    skor[DOMAINS.MENTAL] += 1;
  } else if (gh.olahragaFrekuensi === "sedang") {
    skor[DOMAINS.KARDIO] += 1;
  }

  // Duduk saat kerja
  if (gh.dudukJamPerHari !== undefined && gh.dudukJamPerHari >= 6) {
    skor[DOMAINS.MUSCULO] += 2;
  }
  if (gh.dudukAdaJeda === false) {
    skor[DOMAINS.MUSCULO] += 2;
  }
  if (gh.dudukPostur === "buruk") {
    skor[DOMAINS.MUSCULO] += 2;
  }

  // Alkohol
  if (gh.alkohol === "sering") {
    skor[DOMAINS.KARDIO] += 2;
    skor[DOMAINS.PENCERNAAN] += 1;
  } else if (gh.alkohol === "kadang") {
    skor[DOMAINS.KARDIO] += 1;
  }

  // Merokok
  if (gh.merokok === "aktif") skor[DOMAINS.KARDIO] += 3;
  else if (gh.merokok === "pasif") skor[DOMAINS.KARDIO] += 1;

  // Stres kerja
  if (gh.stresKerja === "berat") {
    skor[DOMAINS.MENTAL] += 3;
    skor[DOMAINS.MUSCULO] += 1;
    skor[DOMAINS.PENCERNAAN] += 1;
  } else if (gh.stresKerja === "sedang") {
    skor[DOMAINS.MENTAL] += 1;
  }

  // Riwayat penyakit keluarga
  const riwayat = gh.riwayatKeluarga || [];
  const riwayatKardio = riwayat.filter((r) =>
    ["hipertensi", "jantung", "diabetes"].includes(r)
  ).length;
  skor[DOMAINS.KARDIO] += Math.min(riwayatKardio, 3);

  // BMI
  if (gh.bmi !== null && gh.bmi !== undefined) {
    if (gh.bmi >= 25) skor[DOMAINS.KARDIO] += 2;
    else if (gh.bmi >= 23) skor[DOMAINS.KARDIO] += 1;
  }

  // Kafein
  if (gh.kafeinCangkirPerHari !== undefined && gh.kafeinCangkirPerHari >= 4) {
    skor[DOMAINS.MENTAL] += 1;
    skor[DOMAINS.PENCERNAAN] += 1;
  }

  return skor;
}

// ----------------------------------------------------------------------------
// Bobot dasar gejala per domain (base weight sebelum dikali multiplier)
// ----------------------------------------------------------------------------
const SYMPTOM_DOMAIN_WEIGHT = {
  sakitKepala: { [DOMAINS.MENTAL]: 1, [DOMAINS.KARDIO]: 0.5 },
  mudahLelah: { [DOMAINS.KARDIO]: 1, [DOMAINS.MENTAL]: 1 },
  nyeriDada: { [DOMAINS.KARDIO]: 3 },
  sesakNapas: { [DOMAINS.KARDIO]: 2 },
  jantungBerdebar: { [DOMAINS.KARDIO]: 2 },
  nyeriUluHati: { [DOMAINS.PENCERNAAN]: 3 },
  nyeriPunggungLeher: { [DOMAINS.MUSCULO]: 3 },
  gangguanTidur: { [DOMAINS.MENTAL]: 2 },
  sulitKonsentrasi: { [DOMAINS.MENTAL]: 2 },
  perubahanBeratBadan: { [DOMAINS.KARDIO]: 1, [DOMAINS.PENCERNAAN]: 1 },
};

const KEPARAHAN_MULTIPLIER = { ringan: 1, sedang: 1.5, berat: 2 };
const FREKUENSI_MULTIPLIER = {
  baru_pertama_kali: 0.5,
  hilang_timbul: 1,
  hampir_tiap_hari: 1.5,
};

function skorGejala(daftarGejala) {
  const skor = {
    [DOMAINS.KARDIO]: 0,
    [DOMAINS.MUSCULO]: 0,
    [DOMAINS.PENCERNAAN]: 0,
    [DOMAINS.MENTAL]: 0,
  };

  for (const g of daftarGejala || []) {
    const bobotDomain = SYMPTOM_DOMAIN_WEIGHT[g.id];
    if (!bobotDomain) continue;
    const mKeparahan = KEPARAHAN_MULTIPLIER[g.keparahan] ?? 1;
    const mFrekuensi = FREKUENSI_MULTIPLIER[g.frekuensi] ?? 1;
    const multiplier = mKeparahan * mFrekuensi;

    for (const [domain, bobot] of Object.entries(bobotDomain)) {
      skor[domain] += bobot * multiplier;
    }
  }

  return skor;
}

// ----------------------------------------------------------------------------
// Entry point: hitung skor total, label, dan domain dominan dari satu payload
// ----------------------------------------------------------------------------
export function hitungSkorLengkap({ gayaHidup, gejala }) {
  const bmi = hitungBMI(gayaHidup.beratKg, gayaHidup.tinggiCm);
  const ghDenganBmi = { ...gayaHidup, bmi };

  const skorGH = skorGayaHidup(ghDenganBmi);
  const skorGj = skorGejala(gejala);

  const skorTotal = {};
  const label = {};
  for (const domain of Object.values(DOMAINS)) {
    const total = Math.round(((skorGH[domain] || 0) + (skorGj[domain] || 0)) * 10) / 10;
    skorTotal[domain] = total;
    label[domain] = scoreToLabel(total);
  }

  const domainDominan = Object.entries(skorTotal).sort((a, b) => b[1] - a[1])[0][0];

  return { bmi, skorTotal, label, domainDominan };
}
