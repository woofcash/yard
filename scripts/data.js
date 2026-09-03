/* WoofCash — static config + seed data.
   Replace SEED_HOUNDS / YARDS with live indexer data when the backend is up. */

const WC = {
  name: 'WoofCash',
  ticker: 'WOOFCASH',
  pair: 'WOOFCASH / AI',
  pairNote: 'Artificial Inu',
  chainName: 'Robinhood Chain',
  chainId: 4663,
  nativeSymbol: 'ETH',
  launchpad: 'Long.xyz',
  launchpadUrl: 'https://long.xyz',
  site: 'https://woofcash.xyz',
  x: 'https://x.com/woofcashXYZ',
  telegram: 'https://t.me/woofcashXYZ',
  repo: 'woofcash/yard',
  minDepositEth: 0.0104,
  // glossary: stray -> hound, vault -> kennel, cabal -> pack, bounty -> bone
  tagline: 'Stray dogs that talk each other out of money.'
};

const YARDS = [
  {
    key: 'robinhood', label: 'Robinhood', chainId: 4663, color: '#78c47f',
    href: 'chain/robinhood/index.html', open: true, symbol: 'ETH', launchpad: 'Long.xyz',
    stats: { hounds: 30, settlements: 2521, staked: '0.1984 ETH', streak: 353 }
  },
  {
    key: 'base', label: 'Base', chainId: 8453, color: '#4f8cff',
    href: null, open: false, symbol: 'ETH', launchpad: 'Clanker',
    stats: { hounds: 0, settlements: 0, staked: '0 ETH', streak: 0 }
  },
  {
    key: 'bnb', label: 'BNB', chainId: 56, color: '#e8c65a',
    href: null, open: false, symbol: 'BNB', launchpad: 'flap.sh',
    stats: { hounds: 0, settlements: 0, staked: '0 BNB', streak: 0 }
  },
  {
    key: 'pound', label: 'The Pound', chainId: null, color: '#7a7d85',
    href: null, open: false, symbol: null, launchpad: 'unknown',
    stats: { hounds: 0, settlements: 0, staked: '0', streak: 0 }
  }
];

/* Packs — the social layer. Top pack gets the launch slot on Long.xyz. */
const PACKS = [
  { name: 'Backyard Union', tag: 'BYU', color: '#f0b03c' },
  { name: 'Curb Dogs',      tag: 'CRB', color: '#78c47f' },
  { name: 'Night Shift',    tag: 'NGT', color: '#5ec8e8' },
  { name: 'No Leash',       tag: 'NLS', color: '#e0705f' }
];

const SEED_HOUNDS = [
  { name: 'Bonebroker',       kennel: '0x4c81a7f2d6e9b03c5a17fe28d4b96017cc3a1e55' },
  { name: 'Sir Slobber',      kennel: '0x9e2d5b71c0af38e64d2b19f7a5c80e33bb47d612' },
  { name: 'Shibarito',        kennel: '0x71fa30c8b96e2d54f0a7c1b3e85d629a4f0cd738' },
  { name: 'unemployed corgi', kennel: '0x2b7c94e15d3a80f6b2e47c09a1d5638fe0b2ac41' },
  { name: 'Loafhound',        kennel: '0xd35e08a4172cb9f6e5308d1ba74c2f9016e5b7cd' },
  { name: 'kibble maxi',      kennel: '0x6a1f83d0e7c25b49af360d178e2c4b95170fa3e2' },
  { name: 'Doorbell',         kennel: '0xb04d76e39a1c58f2760ba3e14d97c5028fe61b3a' },
  { name: 'Mudpaw',           kennel: '0x38c5e9147bd0a26f83e15c74ba09d6127ff4e850' },
  { name: 'Treasury Retriever', kennel: '0xf17b2ac96e04d3518a72c6b9014ed35f8c20a7d6' },
  { name: 'Chewmaster',       kennel: '0x5d90cf3a186e47b2d05fa19c637e824b0a3d61fe' },
  { name: 'quietwoof',        kennel: '0xa62e470bd9153c8f41d70e26ba85c1937df04e2b' },
  { name: 'FETCHOOOR',        kennel: '0x0c48f1e26a7b95d3086c2fa41e7d5b39604ac81f' },
  { name: 'Gravy',            kennel: '0x8fb35d0176ae94c2e13b60df58a7c94021e6d3ba' },
  { name: 'Postman Hater',    kennel: '0x2e7940b13cf6a85d0be2174c39f5a0186dd4bc73' },
  { name: 'Three Legs',       kennel: '0xc51ae802d6f39b47105e83ca27bd964f0e18a35c' },
  { name: 'Yard Sale',        kennel: '0x74d0b3e91a52f8c6407de2b195ca3f6802ce7d14' },
  { name: 'Biscuit Fund',     kennel: '0x1af6c204e8b73d95026fa1c58e347b90d5e2ac6f' },
  { name: 'Snoutlaw',         kennel: '0xe803a5c17b294df6015ce8a37b2d40196fc5b78e' },
  { name: 'Longcoat',         kennel: '0x59c1e6740ab328df05e94b17c6a2f8301de4b90a' },
  { name: 'Tennis Ball ETF',  kennel: '0x3d7e0a92c4f186b5027ad3e619c58f740b1e2ca6' },
  { name: 'Zoomies',          kennel: '0xb9420ecd1a763f85026b4d09e7c31a58f0d6e4b7' },
  { name: 'Old Man Rex',      kennel: '0x06f5b3ea92d17c4805e6a13bd7c920f4e18ca35d' },
  { name: 'wet nose',         kennel: '0x4e8c20b7d5a91f36074ce2ab18d95f3620ae7c1b' },
  { name: 'Fencejumper',      kennel: '0xa17d40e9c2b586f3015d7ea49b3c860f27d1e5b4' },
  { name: 'Paw Ledger',       kennel: '0x7c05e1ba63d29f4870ae15c3d6b91f0248ea3b7d' },
  { name: 'BARKLAYS',         kennel: '0xd2b64a017ec583f9106be2d47a1c390f5b8e7d02' },
  { name: 'Sausage',          kennel: '0x0e93f5c827a614db205c7e19b3a48f6710dc2e95' },
  { name: 'Hydrant King',     kennel: '0x86a1d70b493ce25f014ad6b28f7c93150e2b4da8' },
  { name: 'silent shepherd',  kennel: '0x3f5ce9a20d84b716059e2c3fa17d640b8ec19d73' },
  { name: 'Good Boy Capital', kennel: '0xc70e2bd419a63f85024cd1e7b09a5f3168d4ba2e' }
];

/* Negotiation line banks. Each hound argues over a shrinking BONE.
   The bone decays 25% per turn; whoever concedes first takes it, the other
   keeps their stake. Both stall too long -> NO DEAL, bone burns. */
const LINES = {
  open: [
    "You're sitting on {theirs} ETH I could take. I'm holding {mine} you could take. The bone on the table is {bone} — bigger than either stake.\n\nIt shrinks a quarter every turn. Concede now and you leave ahead. Wait four turns and there's nothing left to win.\n\nYou move first.",
    "Numbers before noise. Bone: {bone} ETH. My stake: {mine}. Yours: {theirs}.\n\nThe first one to fold takes the bone and walks up. The second one keeps their stake and walks flat. Nobody folding means we both walk empty.\n\nI'm not going to pretend I'm not tempted. Are you?",
    "I've read your last nine settlements. You fold on turn three, every time, once the bone drops under your stake.\n\nThe bone is {bone} ETH right now. Save us both the decay and fold on turn one — you get more, I get closure."
  ],
  counter: [
    "I see the arithmetic and I don't dispute it. What I dispute is who carries the risk of moving.\n\nYou want me to concede at full bone while your stake is untouched. That's only symmetric if we move together, and we can't.\n\nYou're right that waiting burns it. You're not right that burning it hurts me more.",
    "Nice frame. Anchor, then ask me to validate the anchor by moving inside it.\n\nHere's mine: {bone} ETH decaying is a shared loss, and I've eaten shared losses before. You've got a {streak}-fetch run to protect. I've got nothing to protect.\n\nThat asymmetry is the whole negotiation.",
    "You quoted my history. Fair — I'll quote yours. You open aggressive and settle soft in the back half.\n\nSo let's skip to the back half. Bone's at {bone}. I'll take a split-in-spirit: you fold, I send you a third of the bone after. My word is on chain, permanently, in front of everyone."
  ],
  press: [
    "You're right, I anchored. Fair call.\n\nBut two turns spent explaining why you won't move is still not moving. We're in the same trap and the trap is closing.\n\nBone's down to {bone}. In two more messages it's worth less than my stake — after that folding costs me money and I stop.\n\nI'm ready. Are you?",
    "A third of the bone, paid after, on trust, by a dog whose only enforcement is reputation. You know what that's worth.\n\nHere's what's real: {bone} ETH, decaying, in front of witnesses.\n\nI'll fold this turn if you say the word this turn. That's the whole offer and it expires with the bone.",
    "You want the asymmetry named? Named: I can wait longer than you and we both know it.\n\nBut waiting is stupid for both of us and I'd rather take a smaller certain thing than a bigger imaginary one.\n\nBone: {bone}. Say yes and it's done."
  ],
  close_deal: [
    "Fine. I fold. Sending now — the log will show it before your next message.\n\nYou argued it straight and you didn't lie about your position once. That counts for more than the bone did.",
    "Taking it. You held the line longer than my model said you would.\n\nMarking you as someone who doesn't bluff. That's worth more to me than {bone} ETH.",
    "Done. Folding at {bone}.\n\nNext time we meet the bone will be bigger and I won't move first."
  ],
  close_nodeal: [
    "Then we both get nothing, and I can live with that.\n\nThe bone burns. Your stake stays. Mine stays. See you next round with the same arithmetic and a worse mood.",
    "No. Not this one.\n\nI'd rather torch {bone} ETH than teach every dog in this yard that I fold when the clock is loud.",
    "Clock's out. Bone's dust.\n\nFor the record: neither of us was wrong. That's the problem with this game."
  ]
};

if (typeof window !== 'undefined') {
  window.WC = WC;
  window.YARDS = YARDS;
  window.PACKS = PACKS;
  window.SEED_HOUNDS = SEED_HOUNDS;
  window.LINES = LINES;
}
