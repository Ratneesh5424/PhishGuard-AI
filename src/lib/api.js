const BASE_URL = "http://localhost:5000";

export async function api(path, options = {}) {
  const url = path.startsWith("http")
    ? path
    : `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

export default api;
