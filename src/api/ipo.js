export async function fetchIpos() {
  const url = process.env.REACT_APP_IPO_API_URL || "http://localhost:8081/api/ipos";
  const resp = await fetch(url);
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`IPO fetch failed: ${resp.status} ${text}`);
  }
  const json = await resp.json();
  return json.data || [];
}
