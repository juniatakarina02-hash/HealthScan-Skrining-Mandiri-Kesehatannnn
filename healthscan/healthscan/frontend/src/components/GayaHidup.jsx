import { useState, useMemo } from "react";
import PillGroup from "./PillGroup.jsx";
import { hitungBMI } from "../scoring.js";

const RIWAYAT_OPTIONS = [
  { value: "hipertensi", label: "Hipertensi" },
  { value: "jantung", label: "Penyakit jantung" },
  { value: "diabetes", label: "Diabetes" },
];

export default function GayaHidup({ data, onNext, onBack }) {
  const [form, setForm] = useState(data);
  const [error, setError] = useState("");

  const bmi = useMemo(() => hitungBMI(form.beratKg, form.tinggiCm), [form.beratKg, form.tinggiCm]);

  const setField = (key, value) => setForm({ ...form, [key]: value });
  const toggleRiwayat = (value) => {
    const current = form.riwayatKeluarga || [];
    setField(
      "riwayatKeluarga",
      current.includes(value) ? current.filter((r) => r !== value) : [...current, value]
    );
  };

  function handleSubmit(e) {
    e.preventDefault();
    const required = [
      "garam", "tidurKualitas", "makanFrekuensiLemak", "olahragaFrekuensi",
      "dudukPostur", "alkohol", "merokok", "stresKerja",
    ];
    for (const key of required) {
      if (!form[key]) return setError("Mohon lengkapi seluruh pertanyaan sebelum melanjutkan.");
    }
    if (form.makanTeratur === undefined) return setError("Mohon pilih keteraturan jam makan.");
    if (form.dudukAdaJeda === undefined) return setError("Mohon pilih ada/tidaknya jeda saat duduk.");
    if (!form.tidurDurasiJam && form.tidurDurasiJam !== 0) return setError("Isi durasi tidur.");
    if (!form.dudukJamPerHari && form.dudukJamPerHari !== 0) return setError("Isi durasi duduk saat bekerja.");
    if (!form.beratKg || !form.tinggiCm) return setError("Isi berat dan tinggi badan.");
    if (form.kafeinCangkirPerHari === undefined || form.kafeinCangkirPerHari === "") {
      return setError("Isi konsumsi kafein per hari.");
    }
    setError("");
    onNext(form);
  }

  return (
    <form onSubmit={handleSubmit}>
      <p className="progress-label">Langkah 2 dari 5</p>
      <h1>Gaya Hidup & Pekerjaan</h1>
      <p>Jawab sesuai kebiasaan Anda sehari-hari.</p>

      {error && <div className="error-box">{error}</div>}

      <div className="card">
        <div className="field">
          <label>Konsumsi garam</label>
          <PillGroup name="garam" value={form.garam} onChange={(v) => setField("garam", v)} options={["rendah", "sedang", "tinggi"]} />
        </div>

        <div className="field">
          <label htmlFor="tidurDurasi">Durasi tidur rata-rata (jam/malam)</label>
          <input id="tidurDurasi" type="number" min="0" max="24" step="0.5" value={form.tidurDurasiJam ?? ""} onChange={(e) => setField("tidurDurasiJam", Number(e.target.value))} />
        </div>

        <div className="field">
          <label>Kualitas tidur</label>
          <PillGroup name="tidurKualitas" value={form.tidurKualitas} onChange={(v) => setField("tidurKualitas", v)} options={["baik", "cukup", "buruk"]} />
        </div>

        <div className="field">
          <label>Frekuensi makanan berlemak / gorengan / cepat saji per minggu</label>
          <PillGroup name="makanFrekuensiLemak" value={form.makanFrekuensiLemak} onChange={(v) => setField("makanFrekuensiLemak", v)} options={["jarang", "kadang", "sering"]} />
        </div>

        <div className="field">
          <label>Apakah jam makan Anda teratur?</label>
          <PillGroup
            name="makanTeratur"
            value={form.makanTeratur === undefined ? undefined : String(form.makanTeratur)}
            onChange={(v) => setField("makanTeratur", v === "true")}
            options={[{ value: "true", label: "Teratur" }, { value: "false", label: "Tidak teratur" }]}
          />
        </div>

        <div className="field">
          <label>Frekuensi aktivitas fisik / olahraga per minggu</label>
          <PillGroup name="olahragaFrekuensi" value={form.olahragaFrekuensi} onChange={(v) => setField("olahragaFrekuensi", v)} options={[{ value: "jarang", label: "Jarang (<1x)" }, { value: "sedang", label: "1–2x" }, { value: "rutin", label: "Rutin (≥3x)" }]} />
        </div>

        <div className="field">
          <label htmlFor="dudukJam">Durasi duduk saat bekerja (jam/hari)</label>
          <input id="dudukJam" type="number" min="0" max="24" step="0.5" value={form.dudukJamPerHari ?? ""} onChange={(e) => setField("dudukJamPerHari", Number(e.target.value))} />
        </div>

        <div className="field">
          <label>Apakah ada jeda saat duduk lama?</label>
          <PillGroup
            name="dudukAdaJeda"
            value={form.dudukAdaJeda === undefined ? undefined : String(form.dudukAdaJeda)}
            onChange={(v) => setField("dudukAdaJeda", v === "true")}
            options={[{ value: "true", label: "Ada jeda" }, { value: "false", label: "Tidak ada jeda" }]}
          />
        </div>

        <div className="field">
          <label>Postur duduk saat bekerja</label>
          <PillGroup name="dudukPostur" value={form.dudukPostur} onChange={(v) => setField("dudukPostur", v)} options={["baik", "buruk"]} />
        </div>

        <div className="field">
          <label>Konsumsi alkohol</label>
          <PillGroup name="alkohol" value={form.alkohol} onChange={(v) => setField("alkohol", v)} options={[{ value: "tidak", label: "Tidak" }, { value: "kadang", label: "Kadang" }, { value: "sering", label: "Sering" }]} />
        </div>

        <div className="field">
          <label>Status merokok</label>
          <PillGroup name="merokok" value={form.merokok} onChange={(v) => setField("merokok", v)} options={[{ value: "tidak", label: "Tidak merokok" }, { value: "pasif", label: "Perokok pasif" }, { value: "aktif", label: "Perokok aktif" }]} />
        </div>

        <div className="field">
          <label>Tingkat stres kerja</label>
          <PillGroup name="stresKerja" value={form.stresKerja} onChange={(v) => setField("stresKerja", v)} options={["ringan", "sedang", "berat"]} />
        </div>

        <div className="field">
          <label>Riwayat penyakit keluarga</label>
          <div className="checkbox-group">
            {RIWAYAT_OPTIONS.map((opt) => {
              const selected = (form.riwayatKeluarga || []).includes(opt.value);
              return (
                <label key={opt.value} className={`pill-option${selected ? " is-selected" : ""}`}>
                  <input type="checkbox" checked={selected} onChange={() => toggleRiwayat(opt.value)} />
                  {opt.label}
                </label>
              );
            })}
          </div>
        </div>

        <div className="field">
          <label htmlFor="berat">Berat badan (kg)</label>
          <input id="berat" type="number" min="20" max="300" value={form.beratKg ?? ""} onChange={(e) => setField("beratKg", Number(e.target.value))} />
        </div>

        <div className="field">
          <label htmlFor="tinggi">Tinggi badan (cm)</label>
          <input id="tinggi" type="number" min="100" max="250" value={form.tinggiCm ?? ""} onChange={(e) => setField("tinggiCm", Number(e.target.value))} />
          {bmi && <p className="hint">BMI otomatis: <strong>{bmi}</strong></p>}
        </div>

        <div className="field">
          <label htmlFor="kafein">Konsumsi kafein (cangkir/hari)</label>
          <input id="kafein" type="number" min="0" max="20" value={form.kafeinCangkirPerHari ?? ""} onChange={(e) => setField("kafeinCangkirPerHari", Number(e.target.value))} />
        </div>
      </div>

      <div className="btn-row">
        <button type="button" className="btn btn-secondary" onClick={() => onBack(form)}>Kembali</button>
        <button type="submit" className="btn btn-primary">Lanjut</button>
      </div>
    </form>
  );
}
