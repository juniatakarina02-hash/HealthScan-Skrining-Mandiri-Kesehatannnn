import { useState } from "react";
import PillGroup from "./PillGroup.jsx";

export default function DataDiri({ data, onNext }) {
  const [form, setForm] = useState(data);
  const [error, setError] = useState("");

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.nama?.trim()) return setError("Nama lengkap wajib diisi.");
    if (!form.usia || form.usia < 10 || form.usia > 120) return setError("Usia tidak valid.");
    if (!form.jenisKelamin) return setError("Pilih jenis kelamin.");
    if (!form.tempatTinggal?.trim()) return setError("Tempat tinggal wajib diisi.");
    if (!form.pekerjaan?.trim()) return setError("Pekerjaan / aktivitas kerja wajib diisi.");
    if (!form.consent) return setError("Anda harus menyetujui penyimpanan data untuk melanjutkan.");
    setError("");
    onNext(form);
  }

  return (
    <form onSubmit={handleSubmit}>
      <p className="progress-label">Langkah 1 dari 5</p>
      <h1>Data Diri</h1>
      <p>Isi data dasar Anda. Data ini dipakai untuk personalisasi hasil skrining.</p>

      {error && <div className="error-box">{error}</div>}

      <div className="card">
        <div className="field">
          <label htmlFor="nama">Nama lengkap</label>
          <input id="nama" type="text" value={form.nama || ""} onChange={set("nama")} placeholder="cth. Siti Aminah" />
        </div>

        <div className="field">
          <label htmlFor="usia">Usia (tahun)</label>
          <input id="usia" type="number" min="10" max="120" value={form.usia || ""} onChange={(e) => setForm({ ...form, usia: Number(e.target.value) })} />
        </div>

        <div className="field">
          <label>Jenis kelamin</label>
          <PillGroup
            name="jenisKelamin"
            value={form.jenisKelamin}
            onChange={(v) => setForm({ ...form, jenisKelamin: v })}
            options={[
              { value: "laki-laki", label: "Laki-laki" },
              { value: "perempuan", label: "Perempuan" },
            ]}
          />
        </div>

        <div className="field">
          <label htmlFor="tempatTinggal">Tempat tinggal (kabupaten/kota)</label>
          <input id="tempatTinggal" type="text" value={form.tempatTinggal || ""} onChange={set("tempatTinggal")} placeholder="cth. Ambarawa, Kabupaten Semarang" />
        </div>

        <div className="field">
          <label htmlFor="pekerjaan">Pekerjaan / jenis aktivitas kerja harian</label>
          <input id="pekerjaan" type="text" value={form.pekerjaan || ""} onChange={set("pekerjaan")} placeholder="cth. Karyawan kantor, sopir, petani" />
        </div>

        <label className="consent-box">
          <input
            type="checkbox"
            checked={!!form.consent}
            onChange={(e) => setForm({ ...form, consent: e.target.checked })}
          />
          <span>
            Saya menyetujui data ini disimpan untuk keperluan skrining kesehatan dan dapat
            diakses oleh admin/tenaga terkait.
          </span>
        </label>
      </div>

      <div className="btn-row">
        <span />
        <button type="submit" className="btn btn-primary">Lanjut</button>
      </div>
    </form>
  );
}
