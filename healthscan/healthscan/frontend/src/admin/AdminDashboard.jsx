import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";

function badgeClass(label) {
  if (label === "Rendah") return "risk-badge risk-badge--rendah";
  if (label === "Sedang") return "risk-badge risk-badge--sedang";
  return "risk-badge risk-badge--tinggi";
}

const DOMAIN_LABEL_SHORT = {
  kardiovaskular: "Kardio",
  muskuloskeletal: "Musculo",
  pencernaan: "Cerna",
  mental: "Mental",
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("created_at");
  const [sortDir, setSortDir] = useState("desc");
  const [username, setUsername] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const me = await api.adminMe();
        setUsername(me.username);
        const list = await api.adminListSubmissions();
        setRows(list);
      } catch (err) {
        navigate("/admin/login");
      }
    })();
  }, [navigate]);

  const filtered = useMemo(() => {
    if (!rows) return [];
    let out = rows;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      out = out.filter((r) => r.nama.toLowerCase().includes(q) || r.tempat_tinggal.toLowerCase().includes(q));
    }
    out = [...out].sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      if (va === vb) return 0;
      const cmp = va > vb ? 1 : -1;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return out;
  }, [rows, search, sortKey, sortDir]);

  function toggleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  async function handleLogout() {
    await api.adminLogout();
    navigate("/admin/login");
  }

  return (
    <div className="app-shell app-shell--wide" style={{ padding: 0 }}>
      <div className="admin-topbar">
        <div>
          <strong>HealthScan Admin</strong>
          {username && <span style={{ color: "var(--text-muted)", marginLeft: 10, fontSize: "0.85rem" }}>masuk sebagai {username}</span>}
        </div>
        <button type="button" className="btn btn-secondary" onClick={handleLogout}>Keluar</button>
      </div>

      <div style={{ padding: "24px" }}>
        <h1>Data Responden</h1>
        <p>Daftar seluruh responden yang telah menyelesaikan skrining HealthScan.</p>

        {error && <div className="error-box">{error}</div>}

        <div className="admin-toolbar">
          <input
            type="search"
            placeholder="Cari nama atau tempat tinggal..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <a className="btn btn-secondary" href={api.adminExportCsvUrl()} target="_blank" rel="noreferrer">
            Ekspor CSV
          </a>
          <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
            {filtered.length} responden
          </span>
        </div>

        {rows === null ? (
          <p>Memuat data...</p>
        ) : rows.length === 0 ? (
          <p>Belum ada responden yang mengirim jawaban.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th onClick={() => toggleSort("created_at")}>Tanggal</th>
                  <th onClick={() => toggleSort("nama")}>Nama</th>
                  <th onClick={() => toggleSort("usia")}>Usia</th>
                  <th>Jenis Kelamin</th>
                  <th>Tempat Tinggal</th>
                  <th>Domain Dominan</th>
                  <th>Kardio</th>
                  <th>Musculo</th>
                  <th>Cerna</th>
                  <th>Mental</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} onClick={() => navigate(`/admin/respondent/${r.id}`)}>
                    <td>{new Date(r.created_at).toLocaleString("id-ID")}</td>
                    <td>{r.nama}</td>
                    <td>{r.usia}</td>
                    <td>{r.jenis_kelamin}</td>
                    <td>{r.tempat_tinggal}</td>
                    <td>{DOMAIN_LABEL_SHORT[r.domain_dominan] || r.domain_dominan}</td>
                    <td><span className={badgeClass(r.label_kardio)}>{r.label_kardio}</span></td>
                    <td><span className={badgeClass(r.label_musculo)}>{r.label_musculo}</span></td>
                    <td><span className={badgeClass(r.label_pencernaan)}>{r.label_pencernaan}</span></td>
                    <td><span className={badgeClass(r.label_mental)}>{r.label_mental}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
