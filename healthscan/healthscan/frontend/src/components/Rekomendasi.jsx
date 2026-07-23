import { useEffect, useMemo, useState } from "react";
import { DOMAIN_LABEL, DOMAINS } from "../scoring.js";
import { facilities, facilityAreas, emergencyContact, distanceKm } from "../data/facilities.js";
import FacilityMap from "./FacilityMap.jsx";

const REKOMENDASI_GAYA_HIDUP = {
  [DOMAINS.KARDIO]: [
    "Kurangi konsumsi garam dan makanan berlemak/gorengan secara bertahap.",
    "Targetkan aktivitas fisik minimal 150 menit/minggu (mis. jalan cepat 30 menit, 5x/minggu).",
    "Jika merokok, mulai kurangi jumlah batang per hari dan cari dukungan berhenti merokok.",
    "Pantau tekanan darah dan berat badan secara berkala, terutama bila ada riwayat keluarga hipertensi/jantung/diabetes.",
  ],
  [DOMAINS.MUSCULO]: [
    "Ambil jeda berdiri/peregangan setiap 30–60 menit saat bekerja duduk lama.",
    "Perbaiki postur duduk: layar sejajar mata, punggung tersangga, kaki menapak lantai.",
    "Lakukan peregangan leher, bahu, dan punggung ringan setiap pagi dan sore.",
  ],
  [DOMAINS.PENCERNAAN]: [
    "Usahakan jam makan teratur dan tidak menunda makan saat bekerja.",
    "Kurangi kafein dan makanan pemicu asam lambung, terutama saat stres tinggi.",
    "Kelola stres kerja dengan teknik relaksasi sederhana (napas dalam, jeda singkat).",
  ],
  [DOMAINS.MENTAL]: [
    "Jaga durasi tidur 7–8 jam per malam dengan jam tidur yang konsisten.",
    "Kurangi konsumsi kafein di sore/malam hari agar tidak mengganggu tidur.",
    "Bicarakan beban kerja dengan atasan/rekan bila stres kerja terasa berat, atau coba teknik manajemen stres.",
  ],
};

const ANJURAN_MEDIS = {
  Rendah: "Belum diperlukan tindakan medis khusus — cukup pertahankan kebiasaan sehat dan pantau berkala.",
  Sedang: "Disarankan konsultasi ke Puskesmas atau klinik terdekat dalam waktu dekat untuk pemeriksaan lebih lanjut.",
  Tinggi: "Disarankan segera memeriksakan diri ke fasilitas kesehatan (Puskesmas/Rumah Sakit) untuk evaluasi lebih lanjut.",
};

export default function Rekomendasi({ hasil, onBack, onRestart }) {
  const { label, domainDominan, domainDominanLabel } = hasil;
  const adaRisikoSedangTinggi = Object.values(label).some((l) => l === "Sedang" || l === "Tinggi");

  const [geoStatus, setGeoStatus] = useState("idle"); // idle | loading | granted | denied
  const [userPosition, setUserPosition] = useState(null);
  const [selectedArea, setSelectedArea] = useState(facilityAreas[0]);

  useEffect(() => {
    if (!adaRisikoSedangTinggi) return;
    if (!navigator.geolocation) {
      setGeoStatus("denied");
      return;
    }
    setGeoStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoStatus("granted");
      },
      () => setGeoStatus("denied"),
      { timeout: 8000 }
    );
  }, [adaRisikoSedangTinggi]);

  const nearestFacilities = useMemo(() => {
    if (!userPosition) return [];
    return facilities
      .map((f) => ({ ...f, distanceKm: distanceKm(userPosition.lat, userPosition.lng, f.lat, f.lng) }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 3);
  }, [userPosition]);

  const groupedByArea = useMemo(
    () => facilities.filter((f) => f.area === selectedArea),
    [selectedArea]
  );

  const displayedFacilities = geoStatus === "granted" ? nearestFacilities : groupedByArea;

  return (
    <div>
      <p className="progress-label">Langkah 5 dari 5</p>
      <h1>Rekomendasi & Fasilitas Terdekat</h1>
      <p>
        Domain risiko tertinggi Anda: <strong>{domainDominanLabel}</strong> ({label[domainDominan]}).
      </p>

      <div className="card">
        <h3>Saran modifikasi gaya hidup</h3>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {REKOMENDASI_GAYA_HIDUP[domainDominan].map((tip, i) => (
            <li key={i} style={{ marginBottom: 6 }}>{tip}</li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h3>Anjuran tindakan medis</h3>
        <p style={{ margin: 0 }}>{ANJURAN_MEDIS[label[domainDominan]]}</p>
      </div>

      {adaRisikoSedangTinggi && (
        <>
          <div className="emergency-banner">
            <span>{emergencyContact.label}</span>
            <span>{emergencyContact.number}</span>
          </div>

          <h3>Fasilitas kesehatan {geoStatus === "granted" ? "terdekat" : "di area Anda"}</h3>

          {geoStatus === "loading" && <p className="hint">Mendeteksi lokasi Anda…</p>}

          {geoStatus === "denied" && (
            <div className="field no-print">
              <label htmlFor="area">Izin lokasi tidak tersedia — pilih area Anda secara manual</label>
              <select id="area" value={selectedArea} onChange={(e) => setSelectedArea(e.target.value)}>
                {facilityAreas.map((area) => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>
          )}

          {geoStatus === "granted" && (
            <FacilityMap facilities={displayedFacilities} userPosition={userPosition} />
          )}

          {displayedFacilities.map((f) => (
            <div className="facility-card" key={f.name}>
              <div>
                <strong>{f.name}</strong>
                <p style={{ margin: "2px 0 0", fontSize: "0.82rem" }}>{f.type} · {f.address}</p>
                {f.phone !== "-" && <p style={{ margin: "2px 0 0", fontSize: "0.82rem" }}>Telp: {f.phone}</p>}
              </div>
              {f.distanceKm !== undefined && (
                <span className="distance">{f.distanceKm.toFixed(1)} km</span>
              )}
            </div>
          ))}
        </>
      )}

      <div className="disclaimer" style={{ marginTop: 16 }}>
        Estimasi skrining awal, bukan diagnosis. Konsultasikan ke tenaga medis.
      </div>

      <div className="btn-row no-print">
        <button type="button" className="btn btn-secondary" onClick={onBack}>Kembali</button>
        <button type="button" className="btn btn-secondary" onClick={() => window.print()}>Unduh / Cetak Ringkasan</button>
        <button type="button" className="btn btn-primary" onClick={onRestart}>Skrining Baru</button>
      </div>
    </div>
  );
}
