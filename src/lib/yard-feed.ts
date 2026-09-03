export const YARD_TOKEN = {
  name: "WoofCash",
  ticker: "WOOFCASH",
  pair: "WOOFCASH/AI",
  address: "0xe9e416d20ef25e35e0bec28b82e8b75eef351e18",
};

const FACTORY = "0xA87D37Ef625Acdc3eC6D8A9cFc376305D8C47232";
const TOKEN = "0xe9e416d20ef25e35e0bec28b82e8b75eef351e18";
const PACKS = [
  { name: "Backyard Union", tag: "BYU", color: "#f0b03c" },
  { name: "Curb Dogs", tag: "CRB", color: "#78c47f" },
];
const BADGES = ["x", "+", "o", "!"];

let cache: { at: number; data: unknown } | null = null;

async function j(url: string) {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function yardSnapshot() {
  if (cache && Date.now() - cache.at < 12000) return cache.data;

  const [logs, addr, dex] = await Promise.all([
    j(`https://robinhoodchain.blockscout.com/api/v2/addresses/${FACTORY}/logs`),
    j(`https://robinhoodchain.blockscout.com/api/v2/addresses/${FACTORY}`),
    j(`https://api.dexscreener.com/latest/dex/tokens/${TOKEN}`),
  ]);

  const items = (logs && logs.items) || [];
  const hounds = [];
  const feed = [];
  let tvl = 0;
  let idx = 0;
  for (const ev of items) {
    const dec = ev.decoded || {};
    const label = String(dec.name || dec.method_call || "");
    if (!label.includes("KennelOpened")) continue;
    const params = dec.parameters || [];
    const get = (n) => {
      const hit = params.find((p) => p.name === n);
      return hit ? hit.value : "";
    };
    const kennel = get("kennel");
    const name = get("name") || "Hound";
    const seed = Number(get("seed") || 0) / 1e18;
    if (!kennel) continue;
    tvl += Number.isFinite(seed) ? seed : 0;
    hounds.push({
      name,
      kennel,
      pack: PACKS[idx % PACKS.length],
      badge: BADGES[idx % BADGES.length],
      balanceEth: Number.isFinite(seed) ? seed : 0.0104,
      wins: 0,
      losses: 0,
      streak: 0,
    });
    feed.push({
      a: name,
      b: "yard",
      kA: kennel,
      kB: FACTORY,
      deal: true,
      amountEth: Number.isFinite(seed) ? seed : 0,
      boneEth: Number.isFinite(seed) ? seed : 0,
      ts: ev.timestamp ? Date.parse(ev.timestamp) : Date.now(),
      turns: [{ who: name, text: `Opened kennel with ${(Number.isFinite(seed) ? seed : 0).toFixed(4)} ETH.` }],
    });
    idx += 1;
  }

  if (!hounds.length) {
    hounds.push({
      name: "Bonebroker",
      kennel: "0xD913abf52F2Fc25271D0041faDF23e0dcfb8e6Fa",
      pack: PACKS[0],
      badge: BADGES[0],
      balanceEth: 0.0104,
      wins: 0,
      losses: 0,
      streak: 0,
    });
    tvl = 0.0104;
  }

  const pair = dex && dex.pairs && dex.pairs[0];
  const volumeUsd = Number((pair && pair.volume && pair.volume.h24) || 0);
  const txns =
    Number((pair && pair.txns && pair.txns.h24 && pair.txns.h24.buys) || 0) +
    Number((pair && pair.txns && pair.txns.h24 && pair.txns.h24.sells) || 0);
  const priceUsd = Number((pair && pair.priceUsd) || 0);
  const priceNative = Number((pair && pair.priceNative) || 0);
  let volumeEth = 0;
  if (volumeUsd > 0 && priceUsd > 0 && priceNative > 0) {
    const ethUsd = priceUsd / priceNative;
    if (ethUsd > 0) volumeEth = volumeUsd / ethUsd;
  }

  const data = {
    chainId: 4663,
    token: YARD_TOKEN,
    stats: {
      settledEth: volumeEth > 0 ? volumeEth : tvl,
      settlements: txns > 0 ? txns : hounds.length,
      hounds: hounds.length,
      volumeUsd: Number.isFinite(volumeUsd) ? volumeUsd : 0,
    },
    hounds,
    live: null,
    feed,
  };
  cache = { at: Date.now(), data };
  return data;
}

export function depositKennel() {
  return { ok: false, error: "use Factory.open on chain" };
}
export function withdrawKennel() {
  return { ok: false, error: "use Kennel.withdrawAll on chain" };
}
