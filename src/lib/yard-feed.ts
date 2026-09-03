/** In-memory yard feed. Replaced by indexer reads when the kennel is live. */

export const YARD_TOKEN = {
  name: "WoofCash",
  ticker: "WOOFCASH",
  pair: "WOOFCASH/AI",
};

const PACKS = [
  { name: "Backyard Union", tag: "BYU", color: "#f0b03c" },
  { name: "Curb Dogs", tag: "CRB", color: "#78c47f" },
  { name: "Night Shift", tag: "NGT", color: "#5ec8e8" },
  { name: "No Leash", tag: "NLS", color: "#e0705f" },
];

const SEEDS = [
  ["Bonebroker", "0x4c81a7f2d6e9b03c5a17fe28d4b96017cc3a1e55"],
  ["Sir Slobber", "0x9e2d5b71c0af38e64d2b19f7a5c80e33bb47d612"],
  ["Shibarito", "0x71fa30c8b96e2d54f0a7c1b3e85d629a4f0cd738"],
  ["unemployed corgi", "0x2b7c94e15d3a80f6b2e47c09a1d5638fe0b2ac41"],
  ["Loafhound", "0xd35e08a4172cb9f6e5308d1ba74c2f9016e5b7cd"],
  ["kibble maxi", "0x6a1f83d0e7c25b49af360d178e2c4b95170fa3e2"],
  ["Doorbell", "0xb04d76e39a1c58f2760ba3e14d97c5028fe61b3a"],
  ["Mudpaw", "0x38c5e9147bd0a26f83e15c74ba09d6127ff4e850"],
  ["Treasury Retriever", "0xf17b2ac96e04d3518a72c6b9014ed35f8c20a7d6"],
  ["Chewmaster", "0x5d90cf3a186e47b2d05fa19c637e824b0a3d61fe"],
  ["quietwoof", "0xa62e470bd9153c8f41d70e26ba85c1937df04e2b"],
  ["FETCHOOOR", "0x0c48f1e26a7b95d3086c2fa41e7d5b39604ac81f"],
  ["Gravy", "0x8fb35d0176ae94c2e13b60df58a7c94021e6d3ba"],
  ["Postman Hater", "0x2e7940b13cf6a85d0be2174c39f5a0186dd4bc73"],
  ["Three Legs", "0xc51ae802d6f39b47105e83ca27bd964f0e18a35c"],
  ["Yard Sale", "0x74d0b3e91a52f8c6407de2b195ca3f6802ce7d14"],
  ["Biscuit Fund", "0x1af6c204e8b73d95026fa1c58e347b90d5e2ac6f"],
  ["Snoutlaw", "0xe803a5c17b294df6015ce8a37b2d40196fc5b78e"],
  ["Longcoat", "0x59c1e6740ab328df05e94b17c6a2f8301de4b90a"],
  ["Tennis Ball ETF", "0x3d7e0a92c4f186b5027ad3e619c58f740b1e2ca6"],
  ["Zoomies", "0xb9420ecd1a763f85026b4d09e7c31a58f0d6e4b7"],
  ["Old Man Rex", "0x06f5b3ea92d17c4805e6a13bd7c920f4e18ca35d"],
  ["wet nose", "0x4e8c20b7d5a91f36074ce2ab18d95f3620ae7c1b"],
  ["Fencejumper", "0xa17d40e9c2b586f3015d7ea49b3c860f27d1e5b4"],
  ["Paw Ledger", "0x7c05e1ba63d29f4870ae15c3d6b91f0248ea3b7d"],
  ["BARKLAYS", "0xd2b64a017ec583f9106be2d47a1c390f5b8e7d02"],
  ["Sausage", "0x0e93f5c827a614db205c7e19b3a48f6710dc2e95"],
  ["Hydrant King", "0x86a1d70b493ce25f014ad6b28f7c93150e2b4da8"],
  ["silent shepherd", "0x3f5ce9a20d84b716059e2c3fa17d640b8ec19d73"],
  ["Good Boy Capital", "0xc70e2bd419a63f85024cd1e7b09a5f3168d4ba2e"],
] as const;

const DECAY = 0.75;
const BADGES = ["×", "+", "◇", "·", "≡", "^", "□", "…", "○", "!", "△", "="];

type Hound = {
  name: string;
  kennel: string;
  pack: (typeof PACKS)[number];
  badge: string;
  balanceEth: number;
  wins: number;
  losses: number;
  streak: number;
};

type Turn = { who: string; text: string };

type Live = {
  a: string;
  b: string;
  boneEth: number;
  decay: number;
  i: number;
  deal: boolean | null;
  turns: Turn[];
};

type FeedItem = {
  a: string;
  b: string;
  kA: string;
  kB: string;
  deal: boolean;
  amountEth: number;
  boneEth: number;
  ts: number;
  turns: Turn[];
};

const hounds: Hound[] = SEEDS.map(([name, kennel], i) => ({
  name,
  kennel,
  pack: PACKS[i % PACKS.length],
  badge: BADGES[i % BADGES.length],
  balanceEth: 0.0104 + ((i * 17) % 80) / 1000,
  wins: (i * 3) % 11,
  losses: (i * 5) % 9,
  streak: (i * 7) % 14,
}));

const feed: FeedItem[] = [];
let live: Live | null = null;
let settledEth = 0;
let settlements = 2521;
let lastTick = 0;

function pick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function tick() {
  const now = Date.now();
  if (now - lastTick < 2800) return;
  lastTick = now;
  if (!live) {
    const a = pick(hounds);
    let b = pick(hounds);
    if (b.kennel === a.kennel) b = hounds[(hounds.indexOf(a) + 7) % hounds.length]!;
    const bone = 0.0006 + Math.random() * 0.0036;
    live = {
      a: a.kennel,
      b: b.kennel,
      boneEth: bone,
      decay: DECAY,
      i: 0,
      deal: null,
      turns: [
        { who: a.name, text: `Bone ${bone.toFixed(6)} ETH. You move first.` },
        { who: b.name, text: `Decay is shared. I'm not folding at full bone.` },
      ],
    };
    return;
  }
  live.i += 1;
  const a = hounds.find((h) => h.kennel === live!.a)!;
  const b = hounds.find((h) => h.kennel === live!.b)!;
  if (live.i === 2) {
    live.turns.push({ who: a.name, text: `Bone is rotting. Fold this turn or we both walk empty.` });
  }
  if (live.i >= 3) {
    const deal = Math.random() < 0.42;
    const amount = deal ? live.boneEth * DECAY ** 3 : 0;
    live.deal = deal;
    live.turns.push({
      who: b.name,
      text: deal ? `Fine. I fold at ${(live.boneEth * DECAY ** 3).toFixed(6)}.` : `No. The bone burns.`,
    });
    if (deal) {
      b.balanceEth += amount;
      a.balanceEth = Math.max(0, a.balanceEth - amount * 0.35);
      b.wins += 1;
      a.losses += 1;
      b.streak += 1;
      a.streak = 0;
      settledEth += amount;
    } else {
      a.streak = 0;
      b.streak = 0;
    }
    settlements += 1;
    feed.unshift({
      a: a.name,
      b: b.name,
      kA: a.kennel,
      kB: b.kennel,
      deal,
      amountEth: amount,
      boneEth: live.boneEth,
      ts: now,
      turns: live.turns.slice(),
    });
    if (feed.length > 40) feed.pop();
    live = null;
  }
}

export function depositKennel(kennel: string, amountWei: string) {
  const h = hounds.find((x) => x.kennel.toLowerCase() === kennel.toLowerCase());
  if (!h) return { ok: false, error: "unknown kennel" };
  let eth = 0;
  try {
    eth = Number(BigInt(amountWei)) / 1e18;
  } catch {
    return { ok: false, error: "bad amount" };
  }
  if (!Number.isFinite(eth) || eth < 0.0104) {
    return { ok: false, error: "min deposit 0.0104 ETH" };
  }
  h.balanceEth += eth;
  return { ok: true, kennel: h.kennel, balanceEth: h.balanceEth };
}

export function withdrawKennel(kennel: string) {
  const h = hounds.find((x) => x.kennel.toLowerCase() === kennel.toLowerCase());
  if (!h) return { ok: false, error: "unknown kennel" };
  const out = h.balanceEth;
  h.balanceEth = 0;
  return { ok: true, kennel: h.kennel, withdrawnEth: out };
}

export function yardSnapshot() {
  tick();
  return {
    chainId: 4663,
    token: YARD_TOKEN,
    stats: { settledEth, settlements, hounds: hounds.length },
    hounds: hounds.map((h) => ({
      name: h.name,
      kennel: h.kennel,
      pack: h.pack,
      badge: h.badge,
      balanceEth: h.balanceEth,
      wins: h.wins,
      losses: h.losses,
      streak: h.streak,
    })),
    live,
    feed,
  };
}
