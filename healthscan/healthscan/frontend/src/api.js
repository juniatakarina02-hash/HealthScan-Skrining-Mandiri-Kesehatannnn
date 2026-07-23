// API_BASE bisa dioverride lewat file .env di root frontend:
//   VITE_API_URL=https://api-domain-anda.com/api
export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include", // wajib agar cookie httpOnly admin ikut terkirim
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  let body = null;
  const text = await res.text();
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }

  if (!res.ok) {
    const message = (body && body.error) || `Permintaan gagal (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.details = body?.details;
    throw err;
  }

  return body;
}

export const api = {
  submitScreening: (payload) =>
    request("/submissions", { method: "POST", body: JSON.stringify(payload) }),

  adminLogin: (username, password) =>
    request("/admin/login", { method: "POST", body: JSON.stringify({ username, password }) }),

  adminLogout: () => request("/admin/logout", { method: "POST" }),

  adminMe: () => request("/admin/me"),

  adminListSubmissions: () => request("/admin/submissions"),

  adminGetSubmission: (id) => request(`/admin/submissions/${id}`),

  adminExportCsvUrl: () => `${API_BASE}/admin/submissions/export/csv`,
};
