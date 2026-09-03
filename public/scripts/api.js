const WC_API_POLL_MS = 4000;
async function wcFetchYard() {
  try {
    const res = await fetch('/api/yard', { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || typeof data !== 'object') return null;
    if (!Array.isArray(data.hounds)) data.hounds = [];
    return data;
  } catch (e) {
    return null;
  }
}
if (typeof window !== 'undefined') {
  Object.assign(window, { WC_API_POLL_MS, wcFetchYard });
}
