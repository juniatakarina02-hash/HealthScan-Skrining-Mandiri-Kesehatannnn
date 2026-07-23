import { useState } from "react";
import PillGroup from "./PillGroup.jsx";
import { SYMPTOMS, FREKUENSI_OPTIONS, KEPARAHAN_OPTIONS, PENCETUS_OPTIONS } from "../data/symptoms.js";

export default function Gejala({ data, onNext, onBack }) {
  // data: array of { id, frekuensi, keparahan, pencetus }
  const [selected, setSelected] = useState(() => new Set((data || []).map((g) => g.id)));
  const [details, setDetails] = useState(() => {
    const map = {};
    for (const g of data || []) map[g.id] = g;
    return map;
  });
  const [error, setError] = useState("");

  function toggleSymptom(id) {
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
      if (!details[id]) {
        setDetails((d) => ({ ...d, [id]: { id, frekuensi: "", keparahan: "", pencetus: "" } }));
      }
    }
    setSelected(next);
  }

  function setDetail(id, key, value) {
    setDetails((d) => ({ ...d, [id]: { ...d[id], [key]: value } }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const list = [];
    for (const id of selected) {
      const d = details[id];
      if (!d?.frekuensi || !d?.keparahan || !d?.pencetus) {
        return setError("Lengkapi frekuensi, keparahan, dan faktor pencetus untuk setiap gejala yang dicentang.");
      }
      list.push(d);
    }
    setError("");
    onNext(list);
  }

  return (
    <form onSubmit={handleSubmit}>
      <p className="progress-label">Langkah 3 dari 5</p>
      <h1>Gejala Kesehatan Saat Ini</h1>
      <p>Centang gejala yang Anda rasakan belakangan ini, lalu lengkapi detailnya.</p>

      {error && <div className="error-box">{error}</div>}

      <div className="card">
        {SYMPTOMS.map((s) => {
          const isChecked = selected.has(s.id);
          const d = details[s.id] || {};
          return (
            <div key={s.id}>
              <label className="checkbox-row">
                <input type="checkbox" checked={isChecked} onChange={() => toggleSymptom(s.id)} />
                <span>{s.label}</span>
              </label>

              {isChecked && (
                <div className="symptom-detail">
                  <div className="field">
                    <label>Frekuensi</label>
                    <PillGroup name={`frek-${s.id}`} value={d.frekuensi} onChange={(v) => setDetail(s.id, "frekuensi", v)} options={FREKUENSI_OPTIONS} />
                  </div>
                  <div className="field">
                    <label>Keparahan</label>
                    <PillGroup name={`kep-${s.id}`} value={d.keparahan} onChange={(v) => setDetail(s.id, "keparahan", v)} options={KEPARAHAN_OPTIONS} />
                  </div>
                  <div className="field" style={{ marginBottom: 0 }}>
                    <label>Faktor pencetus</label>
                    <PillGroup name={`pen-${s.id}`} value={d.pencetus} onChange={(v) => setDetail(s.id, "pencetus", v)} options={PENCETUS_OPTIONS} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {selected.size === 0 && <p className="hint">Tidak mencentang apa pun juga tidak masalah jika Anda tidak merasakan gejala apa-apa.</p>}
      </div>

      <div className="btn-row">
        <button type="button" className="btn btn-secondary" onClick={() => onBack(Array.from(selected).map((id) => details[id]))}>Kembali</button>
        <button type="submit" className="btn btn-primary">Lihat Hasil</button>
      </div>
    </form>
  );
}
