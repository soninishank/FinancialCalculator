export async function fetchIpos() {
  const url = process.env.REACT_APP_IPO_API_URL || "http://localhost:8081/api/ipos";
  console.log(`[API] Fetching IPO list from: ${url}`);
  const resp = await fetch(url);
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`IPO fetch failed: ${resp.status} ${text}`);
  }
  const json = await resp.json();
  console.log(`[API] Received IPO list: ${json.data ? 'Success' : 'No Data'}`);
  // The backend now returns { ok: true, data: { upcoming: [], open: [], closed: [] }, meta... }
  // We return the 'data' part which has the categories.
  return json.data || { upcoming: [], open: [], closed: [] };
}
