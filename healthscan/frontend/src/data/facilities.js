// Dataset fasilitas kesehatan — statis, di-hardcode, TIDAK memakai API pihak
// ketiga live. Koordinat adalah estimasi berdasarkan nama desa/kecamatan;
// verifikasi & sesuaikan titik koordinat presisi terhadap OpenStreetMap
// sebelum dipakai untuk keperluan resmi/final.

export const facilities = [
  // --- Bandungan ---
  {
    name: "Puskesmas Duren",
    type: "Puskesmas",
    area: "Bandungan",
    address: "Jl. Mayor Soeyoto No.19, Piyato, Duren, Bandungan, Kabupaten Semarang, Jawa Tengah 50614",
    phone: "-",
    lat: -7.2170,
    lng: 110.3520,
  },
  {
    name: "Klinik Tri Karya Bandungan",
    type: "Klinik",
    area: "Bandungan",
    address: "Jl. Raya Ambarawa Bandungan, Jombor, Jetis, Bandungan, Kabupaten Semarang, Jawa Tengah 50614",
    phone: "-",
    lat: -7.2055,
    lng: 110.3455,
  },
  {
    name: "Anugrah Medika",
    type: "Klinik",
    area: "Bandungan",
    address: "Jl. Sukorini No.184, Legoksari, Duren, Bandungan, Kabupaten Semarang, Jawa Tengah 50614",
    phone: "-",
    lat: -7.2145,
    lng: 110.3565,
  },
  {
    name: "Puskesmas Jimbaran",
    type: "Puskesmas",
    area: "Bandungan",
    address: "Jl. Raya Tegal Panas - Jimbaran, Sidomukti, Bandungan, Kabupaten Semarang, Jawa Tengah 50661",
    phone: "-",
    lat: -7.2352,
    lng: 110.3652,
  },
  {
    name: "Klinik Denisa Asih Jimbaran",
    type: "Klinik",
    area: "Bandungan",
    address: "Jl. Jimbaran Tegalpanas, Sidomukti, Bandungan, Kabupaten Semarang, Jawa Tengah 50661",
    phone: "-",
    lat: -7.2362,
    lng: 110.3660,
  },

  // --- Ambarawa ---
  {
    name: "Balkesmas Wilayah Ambarawa",
    type: "Balai Kesehatan",
    area: "Ambarawa",
    address: "Jl. Dr. Cipto No.102, Kepatihan, Kranggan, Kec. Ambarawa, Kabupaten Semarang, Jawa Tengah 50613",
    phone: "-",
    lat: -7.2660,
    lng: 110.4060,
  },
  {
    name: "UPTD Puskesmas Ambarawa",
    type: "Puskesmas",
    area: "Ambarawa",
    address: "Panjang Kidul, Panjang, Kec. Ambarawa, Kabupaten Semarang, Jawa Tengah 50614",
    phone: "-",
    lat: -7.2650,
    lng: 110.4055,
  },
  {
    name: "RSUD dr. Gunawan Mangunkusumo",
    type: "Rumah Sakit",
    area: "Ambarawa",
    address: "Jl. R.A. Kartini No.101, Tambakboyo, Losari, Lodoyong, Kec. Ambarawa, Kabupaten Semarang, Jawa Tengah 50611",
    phone: "0298-591020",
    lat: -7.2636,
    lng: 110.4046,
  },
  {
    name: "RSU Bina Kasih Ambarawa",
    type: "Rumah Sakit",
    area: "Ambarawa",
    address: "Jl. Naryoatmajan No.27A, Kranggan, Panjang, Kec. Ambarawa, Kabupaten Semarang, Jawa Tengah 50614",
    phone: "0298-591280",
    lat: -7.2620,
    lng: 110.4030,
  },
  {
    name: "Klinik Utama Rawat Inap Sari Medika",
    type: "Klinik",
    area: "Ambarawa",
    address: "Jl. Jendral Sudirman No.38, Kupangpete, Pete, Kupang, Kec. Ambarawa, Kabupaten Semarang, Jawa Tengah 50612",
    phone: "-",
    lat: -7.2600,
    lng: 110.4010,
  },

  // --- Jambu ---
  {
    name: "Puskesmas Jambu",
    type: "Puskesmas",
    area: "Jambu",
    address: "Jl. Letkol Isdiman No.KM. 1,5, Jambu Kulon, Jambu, Kec. Jambu, Kabupaten Semarang, Jawa Tengah 50663",
    phone: "-",
    lat: -7.2270,
    lng: 110.3850,
  },
  {
    name: "Klinik Dokter Noor Said Dadi Waras",
    type: "Klinik",
    area: "Jambu",
    address: "Jl. Jambu Utara, Jambu Lor, Gondoriyo, Kec. Jambu, Kabupaten Semarang, Jawa Tengah 50663",
    phone: "-",
    lat: -7.2280,
    lng: 110.3862,
  },

  // --- Banyubiru ---
  {
    name: "Puskesmas Banyubiru",
    type: "Puskesmas",
    area: "Banyubiru",
    address: "Jl. Wijaya Kusuma No.47, Yon Zipur 4, Kebondowo, Kec. Banyubiru, Kabupaten Semarang, Jawa Tengah 50664",
    phone: "-",
    lat: -7.2470,
    lng: 110.4100,
  },
  {
    name: "Klinik Kurnia Medika - 24 Jam",
    type: "Klinik",
    area: "Banyubiru",
    address: "Jl. Brongkol No.10, RT.02/RW.02, Dsn Krajan, Banyubiru, Kec. Banyubiru, Kabupaten Semarang, Jawa Tengah 50664",
    phone: "-",
    lat: -7.2480,
    lng: 110.4112,
  },
];

export const facilityAreas = [...new Set(facilities.map((f) => f.area))];

export const emergencyContact = {
  label: "SPGDT / Ambulans Gawat Darurat",
  number: "119",
};

// Haversine distance dalam kilometer
export function distanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
