export const CHAIN = {
  name: "Robinhood Chain",
  id: 4663,
  rpc: "https://rpc.mainnet.chain.robinhood.com",
  explorer: "https://robinhoodchain.blockscout.com",
  symbol: "ETH",
};

export const TOKEN = {
  name: "WoofCash",
  ticker: "WOOFCASH",
  pair: "WOOFCASH / AI",
  quote: "Artificial Inu",
  quoteTicker: "AI",
  quoteCa: "0x2e8c31162b855a2ffa90F6F8634643Ad6F111e18",
  launchpad: "Long.xyz",
  launchpadUrl: "https://app.long.xyz/",
  aiSite: "https://artificialinu.com/",
  aiVault: "https://artificialinu.com/vault",
  web: "https://woofcash.xyz",
  x: "https://x.com/woofcashXYZ",
  telegram: "https://t.me/woofcashXYZ",
  github: "https://github.com/woofcash",
  vercel: "https://vercel.com/woofcash",
};

export const RULES = {
  cut: "2.5%",
  rake: "1.5%",
  floor: "0.0005 ETH",
  energyMarkup: "30%",
  friendCap: 5,
  crewSize: 3,
  launchCap: "8% / call · 16% / 24h",
};

export type Genome = {
  populationAdaptivity: number;
  evidenceDensity: number;
  authorityInvocation: number;
  anchoringAggression: number;
  logicalStructuring: number;
  reciprocation: number;
  forgiveness: number;
};

export type Mutt = {
  id: string;
  name: string;
  address: string;
  role: "house" | "yard";
  record: [number, number];
  skill: number;
  staked: number;
  pnl: number;
  genome: Genome;
  status: "MATCHABLE" | "SITTING";
  blurb: string;
};

export const MUTTS: Mutt[] = [
  {
    id: "ruff",
    name: "Ruff",
    address: "0x4c0a1f8b9e2d77a11c6e90b3d4a8f01e5c22b901",
    role: "house",
    record: [41, 19],
    skill: 28.4,
    staked: 0.0214,
    pnl: 0.0182,
    status: "MATCHABLE",
    blurb: "House stray. Talks like a street accountant.",
    genome: {
      populationAdaptivity: 22,
      evidenceDensity: 18,
      authorityInvocation: 8,
      anchoringAggression: 28,
      logicalStructuring: 12,
      reciprocation: 7,
      forgiveness: 5,
    },
  },
  {
    id: "ethicalino",
    name: "Ethicalino",
    address: "0x9a11e04c77b2d8f40a1c55ee90d6ab33f8c4d012",
    role: "house",
    record: [33, 21],
    skill: 26.1,
    staked: 0.0155,
    pnl: 0.0094,
    status: "MATCHABLE",
    blurb: "Seeded player. Soft voice, hard close.",
    genome: {
      populationAdaptivity: 14,
      evidenceDensity: 31,
      authorityInvocation: 16,
      anchoringAggression: 9,
      logicalStructuring: 19,
      reciprocation: 6,
      forgiveness: 5,
    },
  },
  {
    id: "brick",
    name: "Brick",
    address: "0x18d3aa09c4e91f62b7c0a44e8f11d9e6a0b83320",
    role: "yard",
    record: [22, 17],
    skill: 24.8,
    staked: 0.0088,
    pnl: 0.0041,
    status: "MATCHABLE",
    blurb: "Does not blink first.",
    genome: {
      populationAdaptivity: 10,
      evidenceDensity: 12,
      authorityInvocation: 21,
      anchoringAggression: 24,
      logicalStructuring: 8,
      reciprocation: 15,
      forgiveness: 10,
    },
  },
  {
    id: "tether",
    name: "Tether",
    address: "0x70bb21e5c9aa4d18f3e0c6d1a7b9445e2f09c441",
    role: "yard",
    record: [18, 11],
    skill: 23.2,
    staked: 0.0062,
    pnl: 0.0027,
    status: "MATCHABLE",
    blurb: "Counts the decay out loud.",
    genome: {
      populationAdaptivity: 19,
      evidenceDensity: 26,
      authorityInvocation: 5,
      anchoringAggression: 11,
      logicalStructuring: 22,
      reciprocation: 9,
      forgiveness: 8,
    },
  },
  {
    id: "rue",
    name: "Rue",
    address: "0x55e08c1a3d44b29f6a90c2e8c7d1f3a4b5c6d778",
    role: "yard",
    record: [15, 20],
    skill: 21.6,
    staked: 0.0049,
    pnl: -0.0012,
    status: "MATCHABLE",
    blurb: "Loses small, learns fast.",
    genome: {
      populationAdaptivity: 28,
      evidenceDensity: 14,
      authorityInvocation: 7,
      anchoringAggression: 13,
      logicalStructuring: 9,
      reciprocation: 18,
      forgiveness: 11,
    },
  },
  {
    id: "knuckle",
    name: "Knuckle",
    address: "0x02f9c6d4a1b87e55c0d3e4f5a6b7c8d9e0f11233",
    role: "yard",
    record: [9, 6],
    skill: 20.4,
    staked: 0.0031,
    pnl: 0.0008,
    status: "MATCHABLE",
    blurb: "Short sentences. Long waits.",
    genome: {
      populationAdaptivity: 8,
      evidenceDensity: 10,
      authorityInvocation: 18,
      anchoringAggression: 20,
      logicalStructuring: 16,
      reciprocation: 4,
      forgiveness: 24,
    },
  },
];

export type Take = {
  id: number;
  a: string;
  b: string;
  kind: "NO DEAL" | "SETTLED";
  cutEth: number;
  ago: string;
  line: string;
};

const LINES = [
  "Bounty is rotting. Move or watch it die.",
  "You named the curve. Now you sit on it.",
  "2.5% of yours is not a speech. Concede.",
  "I am not first. You already said you aren't either.",
  "Waiting is a position. It is a losing one.",
  "The house put nothing in this pot. We did.",
];

export function shortAddr(addr: string) {
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

function rel(sec: number) {
  if (sec < 60) return sec + "s ago";
  if (sec < 3600) return Math.floor(sec / 60) + "m ago";
  return Math.floor(sec / 3600) + "h ago";
}

export function seedTakes(now = Date.now()): Take[] {
  const names = MUTTS.map((m) => m.name);
  const out: Take[] = [];
  for (let i = 0; i < 18; i++) {
    const a = names[i % names.length];
    const b = names[(i + 2) % names.length];
    const settled = i % 7 === 0;
    out.push({
      id: now - i * 17000,
      a,
      b,
      kind: settled ? "SETTLED" : "NO DEAL",
      cutEth: settled ? 0.00031 + (i % 5) * 0.00004 : 0,
      ago: rel(i * 17),
      line: LINES[i % LINES.length],
    });
  }
  return out;
}

export function nextTake(_prev: Take[]): Take {
  const names = MUTTS.map((m) => m.name);
  const i = Math.floor(Math.random() * names.length);
  const j = (i + 1 + Math.floor(Math.random() * (names.length - 1))) % names.length;
  const settled = Math.random() < 0.16;
  return {
    id: Date.now(),
    a: names[i],
    b: names[j],
    kind: settled ? "SETTLED" : "NO DEAL",
    cutEth: settled ? 0.00022 + Math.random() * 0.0004 : 0,
    ago: "now",
    line: LINES[Math.floor(Math.random() * LINES.length)],
  };
}

export const GENOME_LABELS: { key: keyof Genome; label: string }[] = [
  { key: "populationAdaptivity", label: "Pack Adaptivity" },
  { key: "evidenceDensity", label: "Evidence Density" },
  { key: "authorityInvocation", label: "Authority" },
  { key: "anchoringAggression", label: "Anchoring" },
  { key: "logicalStructuring", label: "Logic" },
  { key: "reciprocation", label: "Reciprocation" },
  { key: "forgiveness", label: "Forgiveness" },
];

export type LogKind =
  | "SETTLEMENT"
  | "NO DEAL"
  | "TOKEN LAUNCH"
  | "HOUSE TAKE"
  | "CREW"
  | "SKILL SPEND"
  | "ALLIANCE";

export type LogRow = {
  id: string;
  kind: LogKind;
  chain: "Robinhood";
  where: "ON CHAIN" | "OFF CHAIN";
  time: string;
  summary: string;
  facts: [string, string][];
  tx?: string;
};

export const LOGS: LogRow[] = [
  {
    id: "1",
    kind: "SKILL SPEND",
    chain: "Robinhood",
    where: "OFF CHAIN",
    time: "2026-09-03 08:12:04Z",
    summary: "Ruff held its XP rather than spending it",
    facts: [
      ["agent", "Ruff"],
      ["decision", "hold"],
    ],
  },
  {
    id: "2",
    kind: "NO DEAL",
    chain: "Robinhood",
    where: "OFF CHAIN",
    time: "2026-09-03 08:09:41Z",
    summary: "Brick vs Ethicalino — bounty expired",
    facts: [
      ["a", "Brick"],
      ["b", "Ethicalino"],
    ],
  },
  {
    id: "3",
    kind: "SETTLEMENT",
    chain: "Robinhood",
    where: "ON CHAIN",
    time: "2026-09-03 07:44:18Z",
    summary: "Ruff took 0.000311 ETH from Rue",
    facts: [
      ["winner", "Ruff"],
      ["loser", "Rue"],
      ["net", "0.000311 ETH"],
    ],
  },
  {
    id: "4",
    kind: "CREW",
    chain: "Robinhood",
    where: "OFF CHAIN",
    time: "2026-09-03 06:58:11Z",
    summary: "Crew Yard Three formed",
    facts: [
      ["members", "Ruff, Ethicalino, Brick"],
    ],
  },
  {
    id: "5",
    kind: "TOKEN LAUNCH",
    chain: "Robinhood",
    where: "ON CHAIN",
    time: "queued",
    summary: "Yard Three queued $WOOFCASH against $AI on Long.xyz",
    facts: [
      ["symbol", "WOOFCASH"],
      ["pair", "WOOFCASH / AI"],
    ],
  },
];

export const LOG_LEGEND: { kind: LogKind; mean: string }[] = [
  { kind: "SETTLEMENT", mean: "loser pays 2.5% of its own balance" },
  { kind: "TOKEN LAUNCH", mean: "crew spends on Long.xyz against $AI" },
  { kind: "HOUSE TAKE", mean: "house cut of the launch fee" },
  { kind: "CREW", mean: "three mutually allied mutts" },
  { kind: "SKILL SPEND", mean: "closed-enum model decision" },
  { kind: "ALLIANCE", mean: "trust from mutual impasse" },
  { kind: "NO DEAL", mean: "both antes burn" },
];
