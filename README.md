# WoofCash — yard

Pixel-dog negotiation arena on Robinhood Chain 4663.
Static build, zero dependencies, no framework. Open `index.html` or deploy the folder as-is.

| | |
|---|---|
| Token | WoofCash (`WOOFCASH`) |
| Pair | WOOFCASH / AI (Artificial Inu) |
| Chain | Robinhood Chain 4663 |
| Launchpad | Long.xyz |
| Site | woofcash.xyz |
| X / Telegram | @woofcashXYZ |
| Repo | woofcash/yard |

## Files

```
index.html                  THE ARENA — home page
yards.html                  territory picker + hound line-up
leaderboard.html            hound + pack rankings
launches.html               launch slot status
about.html                  the story / rules
logs.html                   full negotiation transcripts
chain/robinhood/            legacy path, redirects to /
styles/woofcash.css         all styling
scripts/pixels.js           procedural pixel dog generator (24x24, no spritesheet)
scripts/data.js             brand config, yards, hounds, packs, dialogue banks (demo fallback only)
scripts/api.js              /api/yard + /api/kennel/* client — the ONLY file that talks to the backend
scripts/world.js            arena engine: canvas, HUD, camera — reads live data when api.js has it
```

## The dogs

There is no sprite sheet and no downloaded art. `wcRasterDog(kennelAddress)` builds a
24×24 grid: each pixel is classified into a part (`ear`, `earInner`, `head`, `muzzle`,
`nose`, `mouth`, `tongue`, `eye`, `collar`, `body`, `leg`, `paw`), shaded against a
top-left light into an 8-step palette ramp, tail painted on top, then outlined.

Traits derived from the address: ramp (8 coats), ear type (`flop` / `prick` / `semi`),
ear length, snout length, head size, build, eye spacing, tail direction and length,
coat pattern (`solid` / `patched` / `tuxedo` / `brindle`) and collar accent colour.
Same address always yields the same dog. Canvases are cached per seed and scale.

To tune the look, edit the geometry constants (`WC_HEAD_CY`, `WC_BODY_CY`, `WC_LEG_TOP`)
and `wcClassify()` in `scripts/pixels.js`. To preview without a browser:

```bash
node -e "const fs=require('fs');const f=new Function(fs.readFileSync('scripts/pixels.js','utf8')+'return{wcRasterDog}')();
console.log(f.wcRasterDog('0xdead').grid.map(r=>r.map(c=>c?'#':' ').join('')).join('\n'))"
```

## Game loop

1. 30 hounds roam a 1600×1000 yard. Each coat is derived deterministically from its kennel address.
2. Every 7–13 s two idle hounds are paired (demo mode only — see below). They walk to each other and sit.
3. A **bone** (bounty) appears, worth more than either dog's exposed stake. It decays **25% per turn**.
4. Four turns of argument stream into the theatre panel on the left.
5. Resolution: one folds (`SETTLED`, bone transfers, streak +1) or nobody does (`NO DEAL`, bone burns).
6. Result pushes to the fetch feed, the ticker, and the HUD counters.

## Data contract — demo vs. live

`world.js` never generates fake wins on its own once a backend exists. Every 4s it calls
`wcFetchYard()` (in `scripts/api.js`), which hits `GET /api/yard`:

```ts
GET /api/yard
{
  chainId: 4663,
  token: { name: "WoofCash", ticker: "WOOFCASH", pair: "WOOFCASH/AI" },
  stats: { settledEth: number, settlements: number, hounds: number },
  hounds: [{ name, kennel, pack, badge, balanceEth, wins, losses, streak }],
  live: null | {
    a, b,              // kennel address OR name — either matches the roster
    boneEth, decay: 0.75, i, deal: boolean | null,
    turns: [{ who, text }]
  },
  feed: [{ a, b, kA, kB, deal, amountEth, boneEth, ts, turns }]
}

POST /api/kennel/deposit   { kennel, amountWei }
POST /api/kennel/withdraw  { kennel }   // only owner
```

- **Endpoint answers with valid JSON** → the arena switches to `mode = 'live'`. Hound roster,
  stats, the active negotiation, and the feed all come from the response. Positions/movement in
  the yard stay client-side (the contract has no notion of x/y — that's presentation only).
  The `SOURCE` pill in the HUD turns green and reads `LIVE`.
- **Endpoint 404s, times out, or returns malformed JSON** → nothing crashes. The arena falls back
  to the self-contained demo simulation (`startDemoEncounter` / `resolveDemoEncounter` in
  `world.js`, dialogue from `scripts/data.js`). The `SOURCE` pill reads `DEMO` in gold.
- Rules are identical in both modes: min deposit **0.0104 ETH**, bone decays **×0.75 per turn**,
  first fold takes the bone, mutual holdout burns it, pair is **Long.xyz · WOOFCASH/AI · Robinhood 4663**.

**Do not edit `pixels.js`, the canvas draw loop, or the HUD markup to wire up the backend** — every
integration point is `scripts/api.js` (add auth headers, change the base URL, add retries there) plus
the small adapter block in `world.js` (`syncRoster`, `applyLiveEncounter`, `normalizeFeedEntry`,
`pollApi`). That's the entire seam between design and mechanics.

## Terminology map (from the cat-yard original)

stray → hound · vault → kennel · cabal → pack · bounty → bone · territories → yards · letscash → Long.xyz

## Deploy

Fully static — `vercel deploy` from this folder, or drag it into the Vercel dashboard. No build step, no env vars.
Fonts load from Google Fonts; self-host `Pixelify Sans` + `IBM Plex Mono` into `styles/` if you want zero third-party requests.

## Known gaps before mainnet

- Kennel factory not deployed; "Fund a hound" is an explainer modal, not a wallet flow yet.
  Wiring it to `POST /api/kennel/deposit` + a wallet signer is the token layer's job, not this repo's.
- Leaderboard and logs still use seeded numbers — they're a separate static page, not yet on the
  `/api/yard` feed. Port them to the same contract once the backend is live.
- No wallet connect, no RPC calls in `scripts/*` — that boundary is intentional (see Data contract above).

## Branching

`main` is a separate Vite + TanStack app with its own token/mechanics work in progress.
This design (canvas, pixel-dog generator, HUD, theatre, feeds) lives on `claude/pixel-dog-arena`
pending integration — see the Data contract section for the exact seam. Do not merge over `main`
without an explicit decision to replace it; check with the project owner first.
