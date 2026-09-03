/* WoofCash — data layer adapter.
   Talks to the token/mechanics backend at /api/yard, /api/kennel/*.
   world.js falls back to its own local simulation whenever this returns
   null (endpoint not deployed yet, network error, or malformed payload) —
   the yard is never empty, but it is never fake once the API is live. */

const WC_API_POLL_MS = 4000;

async function wcFetchYard() {
  try {
    const res = await fetch('/api/yard', { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || !Array.isArray(data.hounds)) return null;
    return data;
  } catch (e) {
    return null;
  }
}

async function wcPostDeposit(kennel, amountWei) {
  const res = await fetch('/api/kennel/deposit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kennel, amountWei })
  });
  if (!res.ok) throw new Error('deposit failed: ' + res.status);
  return res.json();
}

async function wcPostWithdraw(kennel) {
  const res = await fetch('/api/kennel/withdraw', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kennel })
  });
  if (!res.ok) throw new Error('withdraw failed: ' + res.status);
  return res.json();
}

if (typeof window !== 'undefined') {
  Object.assign(window, { WC_API_POLL_MS, wcFetchYard, wcPostDeposit, wcPostWithdraw });
}
