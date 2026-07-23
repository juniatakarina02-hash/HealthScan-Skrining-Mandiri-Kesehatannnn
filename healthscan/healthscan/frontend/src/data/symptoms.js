// Daftar gejala — id di sini HARUS sinkron dengan kunci SYMPTOM_DOMAIN_WEIGHT
// di scoring.js (frontend & server).
export const SYMPTOMS = [
  { id: "sakitKepala", label: "Sakit kepala" },
  { id: "mudahLelah", label: "Mudah lelah" },
  { id: "nyeriDada", label: "Nyeri dada" },
  { id: "sesakNapas", label: "Sesak napas" },
  { id: "jantungBerdebar", label: "Jantung berdebar" },
  { id: "nyeriUluHati", label: "Nyeri ulu hati" },
  { id: "nyeriPunggungLeher", label: "Nyeri punggung / leher" },
  { id: "gangguanTidur", label: "Gangguan tidur" },
  { id: "sulitKonsentrasi", label: "Sulit konsentrasi" },
  { id: "perubahanBeratBadan", label: "Perubahan berat badan" },
];

export const FREKUENSI_OPTIONS = [
  { value: "baru_pertama_kali", label: "Baru pertama kali" },
  { value: "hilang_timbul", label: "Hilang timbul" },
  { value: "hampir_tiap_hari", label: "Hampir tiap hari" },
];

export const KEPARAHAN_OPTIONS = [
  { value: "ringan", label: "Ringan" },
  { value: "sedang", label: "Sedang" },
  { value: "berat", label: "Berat" },
];

export const PENCETUS_OPTIONS = [
  { value: "saat kerja", label: "Saat kerja" },
  { value: "saat istirahat", label: "Saat istirahat" },
  { value: "setelah makan", label: "Setelah makan" },
  { value: "saat stres", label: "Saat stres" },
];
