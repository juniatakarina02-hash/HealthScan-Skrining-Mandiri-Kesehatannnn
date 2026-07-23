import { useMemo, useState } from "react";
import { hitungSkorLengkap, DOMAIN_LABEL, DOMAINS } from "../scoring.js";
import { api } from "../api.js";

const PENJELASAN = {
  [DOMAINS.KARDIO]:
    "Berkaitan dengan tekanan darah, jantung, dan metabolisme tubuh — dipengaruhi garam, lemak, olahraga, dan rokok.",
  [DOMAINS.MUSCULO]:
    "Berkaitan dengan otot, tulang, dan sendi — dipengaruhi durasi duduk, postur, dan jeda istirahat.",
  [DOMAINS.PENCERNAAN]:
    "Berkaitan dengan lambung dan sistem cerna — dipengaruhi keteraturan makan, stres, dan kafein.",
  [DOMAINS.MENTAL]:
    "Berkaitan dengan tidur, konsentrasi, dan tekanan psikologis — dipengaruhi stres kerja dan kualitas tidur.",
};

function badgeClass(label) {
  if (label === "Rendah") return "risk-badge risk-badge--rendah";
  if (label === "Sedang") return "risk-badge risk-badge--sedang";
  return "risk-badge risk-badge--tinggi";
}

export default function Hasil({ dataDiri, gayaHidup, gejala, onNext, onBack }) {
  const clientResult = useMemo(
    () => hitungSkorLengkap({ gayaHidup, gejala }),
    [gayaHidup, gejala]
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleLanjut() {
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        consent: !!dataDiri.consent,
        nama: dataDiri.nama,
        usia: dataDiri.usia,
        jenisKelamin: dataDiri.jenisKelamin,
        tempatTinggal: dataDiri.tempatTinggal,
        pekerjaan: dataDiri.pekerjaan,
        gayaHidup,
        gejala,
      };
      const serverResult = await api.submitScreening(payload);
      onNext(serverResult);
    } catch (err) {
      setError(
        err.status === 400
          ? "Beberapa data belum lengkap atau tidak valid. Silakan periksa kembali jawaban Anda di langkah sebelumnya."
          : "Gagal mengirim hasil skrining. Periksa koneksi Anda dan coba lagi."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const { skorTotal, label, domainDominan } = clientResult;

  return (
    <div>
      <p className="progress-label">Langkah 4 dari 5</p>
      <h1>Hasil Skrining</h1>
      <p>Berikut estimasi tingkat risiko Anda di empat domain kesehatan.</p>

      {error && <div className="error-box">{error}</div>}

      <div className="risk-grid">
        {Object.values(DOMAINS).map((domain) => (
          <div key={domain} className={`risk-card${domain === domainDominan ? " is-dominant" : ""}`}>
            <span className={badgeClass(label[domain])}>{label[domain]}</span>
            <h3>{DOMAIN_LABEL[domain]}</h3>
            <p>{PENJELASAN[domain]}</p>
          </div>
        ))}
      </div>

      <div className="disclaimer" style={{ marginTop: 16 }}>
        Estimasi skrining awal, bukan diagnosis. Konsultasikan ke tenaga medis.
      </div>

      <div className="btn-row">
        <button type="button" className="btn btn-secondary" onClick={onBack} disabled={submitting}>
          Kembali
        </button>
        <button type="button" className="btn btn-primary" onClick={handleLanjut} disabled={submitting}>
          {submitting ? "Mengirim..." : "Lihat Rekomendasi"}
        </button>
      </div>
    </div>
  );
}
