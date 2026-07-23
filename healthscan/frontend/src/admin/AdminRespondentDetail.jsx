import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { api } from "../api.js";
import { SYMPTOMS, FREKUENSI_OPTIONS, KEPARAHAN_OPTIONS } from "../data/symptoms.js";

function badgeClass(label) {
  if (label === "Rendah") return "risk-badge risk-badge--rendah";
  if (label === "Sedang") return "risk-badge risk-badge--sedang";
  return "risk-badge risk-badge--tinggi";
}

const label = (map, value) => map.find((o) => o.value === value)?.label || value;
const symptomLabel = (id) => SYMPTOMS.find((s) => s.id === id)?.label || id;

export default function AdminRespondentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const d = await api.adminGetSubmission(id);
        setData(d);
      } catch (err) {
        if (err.status === 401) navigate("/admin/login");
        else setError(err.message);
      }
    })();
  }, [id, navigate]);

  if (error) {
    return (
      <div className="app-shell" style={{ paddingTop: 40 }}>
        <div className="error-box">{error}</div>
        <Link to="/admin/dashboard" className="btn btn-secondary">Kembali ke daftar</Link>
      </div>
    );
  }

  if (!data) return <div className="app-shell" style={{ paddingTop: 40 }}>Memuat data...</div>;

  const gh = data.gayaHidup;

  return (
    <div className="app-shell app-shell--wide" style={{ paddingTop: 24 }}>
      <Link to="/admin/dashboard" className="btn btn-secondary no-print" style={{ marginBottom: 16 }}>
        &larr; Kembali ke daftar
      </Link>

      <h1>{data.nama}</h1>
      <p>
        {data.usia} tahun · {data.jenis_kelamin} · {data.tempat_tinggal} · {data.pekerjaan}
      </p>
      <p className="hint">Dikirim: {new Date(data.created_at).toLocaleString("id-ID")}</p>

      <h3>Skor Risiko</h3>
      <div className="risk-grid" style={{ marginBottom: 20 }}>
        <div className="risk-card">
          <span className={badgeClass(data.label_kardio)}>{data.label_kardio}</span>
          <h3>Kardiovaskular / Metabolik</h3>
          <p>Skor: {data.skor_kardio}</p>
        </div>
        <div className="risk-card">
          <span className={badgeClass(data.label_musculo)}>{data.label_musculo}</span>
          <h3>Muskuloskeletal</h3>
          <p>Skor: {data.skor_musculo}</p>
        </div>
        <div className="risk-card">
          <span className={badgeClass(data.label_pencernaan)}>{data.label_pencernaan}</span>
          <h3>Pencernaan</h3>
          <p>Skor: {data.skor_pencernaan}</p>
        </div>
        <div className="risk-card">
          <span className={badgeClass(data.label_mental)}>{data.label_mental}</span>
          <h3>Kesehatan Mental</h3>
          <p>Skor: {data.skor_mental}</p>
        </div>
      </div>

      <h3>Gaya Hidup & Pekerjaan</h3>
      <div className="detail-grid">
        <div className="detail-item"><div className="label">BMI</div><div className="value">{data.bmi ?? "-"}</div></div>
        <div className="detail-item"><div className="label">Konsumsi garam</div><div className="value">{gh.garam}</div></div>
        <div className="detail-item"><div className="label">Durasi tidur</div><div className="value">{gh.tidurDurasiJam} jam</div></div>
        <div className="detail-item"><div className="label">Kualitas tidur</div><div className="value">{gh.tidurKualitas}</div></div>
        <div className="detail-item"><div className="label">Makanan berlemak</div><div className="value">{gh.makanFrekuensiLemak}</div></div>
        <div className="detail-item"><div className="label">Jam makan teratur</div><div className="value">{gh.makanTeratur ? "Ya" : "Tidak"}</div></div>
        <div className="detail-item"><div className="label">Olahraga</div><div className="value">{gh.olahragaFrekuensi}</div></div>
        <div className="detail-item"><div className="label">Duduk/hari</div><div className="value">{gh.dudukJamPerHari} jam</div></div>
        <div className="detail-item"><div className="label">Jeda duduk</div><div className="value">{gh.dudukAdaJeda ? "Ada" : "Tidak ada"}</div></div>
        <div className="detail-item"><div className="label">Postur duduk</div><div className="value">{gh.dudukPostur}</div></div>
        <div className="detail-item"><div className="label">Alkohol</div><div className="value">{gh.alkohol}</div></div>
        <div className="detail-item"><div className="label">Merokok</div><div className="value">{gh.merokok}</div></div>
        <div className="detail-item"><div className="label">Stres kerja</div><div className="value">{gh.stresKerja}</div></div>
        <div className="detail-item"><div className="label">Kafein/hari</div><div className="value">{gh.kafeinCangkirPerHari} cangkir</div></div>
        <div className="detail-item"><div className="label">Riwayat keluarga</div><div className="value">{(gh.riwayatKeluarga || []).join(", ") || "-"}</div></div>
      </div>

      <h3>Gejala yang Dilaporkan</h3>
      {data.gejala.length === 0 ? (
        <p>Tidak ada gejala dilaporkan.</p>
      ) : (
        data.gejala.map((g) => (
          <div className="symptom-record" key={g.id}>
            <strong>{symptomLabel(g.id)}</strong> — {label(FREKUENSI_OPTIONS, g.frekuensi)},{" "}
            keparahan {label(KEPARAHAN_OPTIONS, g.keparahan)}, pencetus: {g.pencetus}
          </div>
        ))
      )}
    </div>
  );
}
