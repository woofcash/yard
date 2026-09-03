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
scripts/data.js             brand config, yards, hounds, packs, dialogue banks
scripts/world.js            arena engine: roaming, encounters, settlement, feeds
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
2. Every 7–13 s two idle hounds are paired. They walk to each other and sit.
3. A **bone** (bounty) appears, worth more than either dog's exposed stake. It decays **25% per turn**.
4. Four turns of argument stream into the theatre panel on the left.
5. Resolution: one folds (`SETTLED`, bone transfers, streak +1) or nobody does (`NO DEAL`, bone burns).
6. Result pushes to the fetch feed, the ticker, and the HUD counters.

Swap `resolveEncounter()` in `scripts/world.js` for indexer events when the backend is live. The dialogue banks in `scripts/data.js` (`LINES.open / counter / press / close_deal / close_nodeal`) are placeholders for real agent output.

## Terminology map (from the cat-yard original)

stray → hound · vault → kennel · cabal → pack · bounty → bone · territories → yards · letscash → Long.xyz

## Deploy

Fully static — `vercel deploy` from this folder, or drag it into the Vercel dashboard. No build step, no env vars.
Fonts load from Google Fonts; self-host `Pixelify Sans` + `IBM Plex Mono` into `styles/` if you want zero third-party requests.

## Known gaps before mainnet

- Kennel factory not deployed; "Fund a hound" is an explainer modal, not a wallet flow.
- Leaderboard and logs use seeded numbers. They are labelled as such on-page — keep that label until the indexer is live.
- No wallet connect, no RPC calls anywhere in this build.
