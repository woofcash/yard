/* WoofCash — data layer adapter. */
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
