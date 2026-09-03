/* WoofCash — yard arena engine.
   Canvas, HUD, and hound rendering are untouched — this file only decides
   WHERE the game state comes from: /api/yard when it answers, or the
   built-in local simulation when it doesn't (pre-launch, offline, error).
   See scripts/api.js for the wire format and README.md for the contract. */

(function () {
  'use strict';

  // ---------- world constants ----------
  const FIELD_W = 1600;
  const FIELD_H = 1000;
  const PX = 3;                 // pixel scale of a 24x24 hound
  const DOG = 24 * PX;
  const SPEED = 24;
  const MEET_EVERY = [6, 12];   // demo-mode only
  const TURN_MS = 2600;         // demo-mode only
  const DECAY = 0.75;
  const RESULT_HOLD_MS = 6000;  // how long a settled pair stays put before roaming off
  const BADGES = ['×', '+', '◇', '·', '≡', '^', '□', '…', '○', '!', '△', '='];

  const canvas = document.getElementById('yard-canvas');
  const ctx = canvas.getContext('2d');
  let VW = 0, VH = 0, DPR = 1;

  const cam = { x: FIELD_W / 2, y: FIELD_H / 2, z: 1, tx: FIELD_W / 2, ty: FIELD_H / 2, tz: 1 };
  let following = true;

  // ---------- state ----------
  const hounds = [];            // visual roster; positions are always client-side
  let feed = [];                // rendered feed — demo-generated or mirrored from API
  let live = null;              // current encounter shown in the theatre
  let replay = null;
  let nextMeet = 2.5;           // demo-mode encounter timer
  let settledTotal = 0;
  let settlementCount = 2521;   // seeded until the API reports a real number
  let tab = 'fetches';

  let mode = 'demo';            // 'demo' | 'live' — flips the moment /api/yard answers
  let apiTried = false;

  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const eth = n => Number(n || 0).toFixed(6);
  const short = a => (a && a.length > 12) ? a.slice(0, 6) + '…' + a.slice(-4) : (a || '');
  const el = id => document.getElementById(id);

  function ago(ts) {
    const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
    if (s < 60) return s + 's ago';
    if (s < 3600) return Math.floor(s / 60) + 'm ago';
    return Math.floor(s / 3600) + 'h ago';
  }

  // ---------- hound spawning (shared by demo seed data and live roster sync) ----------
  function spawnHound(seed) {
    const angle = Math.random() * Math.PI * 2;
    return {
      name: seed.name,
      kennel: seed.kennel,
      pack: resolvePack(seed.pack),
      badge: seed.badge || BADGES[window.wcHash(seed.kennel + 'b') % BADGES.length],
      x: rand(120, FIELD_W - 120),
      y: rand(140, FIELD_H - 120),
      vx: Math.cos(angle) * SPEED,
      vy: Math.sin(angle) * SPEED,
      state: 'roam',
      partner: null,
      balance: seed.balanceEth ?? seed.balance ?? rand(0.0104, 0.09),
      wins: seed.wins || 0,
      losses: seed.losses || 0,
      streak: seed.streak || 0,
      bob: Math.random() * 10,
      flip: Math.random() < 0.5,
      glow: 0
    };
  }

  function resolvePack(p) {
    if (p && typeof p === 'object' && p.tag) return p;
    if (typeof p === 'string') {
      const found = window.PACKS.find(x => x.tag === p || x.name === p);
      if (found) return found;
    }
    return window.PACKS[window.wcHash(String(p || Math.random())) % window.PACKS.length];
  }

  function findHound(ref) {
    if (!ref) return null;
    return hounds.find(h => h.kennel === ref || h.name === ref) || null;
  }

  // demo roster, only used while mode === 'demo'
  window.SEED_HOUNDS.forEach(s => hounds.push(spawnHound(s)));

  // pack neighbour lines — recomputed whenever the roster changes shape
  let links = [];
  function rebuildLinks() {
    links = [];
    window.PACKS.forEach(p => {
      const members = hounds.filter(h => h.pack.tag === p.tag);
      for (let i = 0; i < members.length - 1; i++) links.push([members[i], members[i + 1]]);
    });
  }
  rebuildLinks();

  // ---------- live-mode roster sync ----------
  function syncRoster(apiHounds) {
    const seen = new Set();
    apiHounds.forEach(h => {
      if (!h || !h.kennel) return;
      seen.add(h.kennel);
      let hound = findHound(h.kennel);
      if (!hound) {
        hound = spawnHound(h);
        hounds.push(hound);
      } else {
        hound.name = h.name || hound.name;
        hound.pack = resolvePack(h.pack);
        hound.badge = h.badge || hound.badge;
        hound.balance = h.balanceEth ?? hound.balance;
        hound.wins = h.wins ?? hound.wins;
        hound.losses = h.losses ?? hound.losses;
        hound.streak = h.streak ?? hound.streak;
      }
    });
    // hounds the API no longer lists are dropped from the roster (rare — retirement/merge)
    for (let i = hounds.length - 1; i >= 0; i--) {
      if (!seen.has(hounds[i].kennel) && hounds[i].kennel !== undefined) {
        if (live && (live.a === hounds[i] || live.b === hounds[i])) continue; // don't yank a talking dog
        hounds.splice(i, 1);
      }
    }
    rebuildLinks();
  }

  function normalizeFeedEntry(e) {
    return {
      a: e.a, b: e.b, kA: e.kA || e.a, kB: e.kB || e.b,
      deal: !!e.deal,
      amount: e.amountEth ?? e.amount ?? 0,
      ts: e.ts || Date.now(),
      turns: e.turns || []
    };
  }

  function applyLiveEncounter(serverLive) {
    if (!serverLive) {
      if (live && live.fromApi) { live = null; renderTheatre(); }
      return;
    }
    const a = findHound(serverLive.a);
    const b = findHound(serverLive.b);
    if (!a || !b) return; // roster hasn't caught up yet — try again next poll

    if (a.state !== 'talk' || a.partner !== b) { a.state = 'talk'; a.partner = b; }
    if (b.state !== 'talk' || b.partner !== a) { b.state = 'talk'; b.partner = a; }

    const decay = serverLive.decay || DECAY;
    const done = serverLive.deal === true || serverLive.deal === false;
    live = {
      a, b,
      bone: serverLive.boneEth || 0,
      decay,
      i: serverLive.i ?? 0,
      done,
      deal: serverLive.deal,
      turns: (serverLive.turns || []).map(t => ({
        who: (t.who === a.kennel || t.who === a.name) ? a : b,
        text: t.text
      })),
      fromApi: true
    };
    renderTheatre();

    if (done) {
      setTimeout(() => {
        if (a.partner === b) { a.state = 'roam'; a.partner = null; releaseVelocity(a); }
        if (b.partner === a) { b.state = 'roam'; b.partner = null; releaseVelocity(b); }
      }, RESULT_HOLD_MS);
    }
  }

  function releaseVelocity(h) {
    const ang = Math.random() * Math.PI * 2;
    h.vx = Math.cos(ang) * SPEED;
    h.vy = Math.sin(ang) * SPEED;
  }

  // ---------- polling ----------
  async function pollApi() {
    const data = await window.wcFetchYard();
    apiTried = true;
    if (!data) {
      updateSourcePill();
      return; // stay in whatever mode we were already in
    }
    mode = 'live';
    syncRoster(data.hounds || []);
    if (data.stats) {
      settledTotal = data.stats.settledEth ?? settledTotal;
      settlementCount = data.stats.settlements ?? settlementCount;
    }
    if (Array.isArray(data.feed)) feed = data.feed.map(normalizeFeedEntry);
    applyLiveEncounter(data.live || null);
    renderStats(); renderFeed(); renderTicker(); renderReplay();
    updateSourcePill();
  }

  function updateSourcePill() {
    const pill = el('stat-source');
    if (!pill) return;
    pill.textContent = mode === 'live' ? 'LIVE' : 'DEMO';
    pill.className = mode === 'live' ? 'src-live' : 'src-demo';
  }

  // ---------- viewport ----------
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    VW = canvas.clientWidth;
    VH = canvas.clientHeight;
    canvas.width = VW * DPR;
    canvas.height = VH * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.imageSmoothingEnabled = false;
  }
  window.addEventListener('resize', resize);
  function baseScale() { return Math.max(VW / FIELD_W, VH / FIELD_H); }

  // ---------- demo-mode encounters (only run while mode === 'demo') ----------
  const fmt = (tpl, v) => tpl.replace(/\{(\w+)\}/g, (_, k) => v[k] !== undefined ? v[k] : '{' + k + '}');

  function startDemoEncounter() {
    const idle = hounds.filter(h => h.state === 'roam');
    if (idle.length < 2) return;
    const a = pick(idle);
    let b = pick(idle), guard = 0;
    while (b === a && guard++ < 20) b = pick(idle);
    if (a === b) return;

    a.state = b.state = 'approach';
    a.partner = b; b.partner = a;

    const bone = rand(0.0006, 0.0042);
    const vals = {
      bone: eth(bone),
      mine: eth(a.balance * rand(0.2, 0.5)),
      theirs: eth(b.balance * rand(0.2, 0.5)),
      streak: b.streak + Math.floor(rand(3, 40))
    };
    const deal = Math.random() < 0.42;
    const finalBone = bone * Math.pow(DECAY, 3);

    live = {
      a, b, bone, decay: DECAY, deal, i: -1, t: 0, done: false, fromApi: false,
      turns: [
        { who: a, text: fmt(pick(window.LINES.open), vals) },
        { who: b, text: fmt(pick(window.LINES.counter), Object.assign({}, vals, { bone: eth(bone * DECAY) })) },
        { who: a, text: fmt(pick(window.LINES.press), Object.assign({}, vals, { bone: eth(bone * DECAY * DECAY) })) },
        { who: b, text: fmt(pick(deal ? window.LINES.close_deal : window.LINES.close_nodeal), Object.assign({}, vals, { bone: eth(finalBone) })) }
      ]
    };
    renderTheatre();
  }

  function resolveDemoEncounter() {
    const { a, b, deal, amount } = live;
    const finalAmount = deal ? live.bone * Math.pow(DECAY, 3) : 0;
    if (deal) {
      b.balance += finalAmount;
      a.balance = Math.max(0, a.balance - finalAmount * 0.35);
      b.wins++; a.losses++; b.streak++; a.streak = 0;
      settledTotal += finalAmount;
      b.glow = 1.6;
    } else { a.streak = 0; b.streak = 0; }
    settlementCount++;

    feed.unshift({ a: a.name, b: b.name, kA: a.kennel, kB: b.kennel, deal, amount: finalAmount, ts: Date.now(), turns: live.turns.slice() });
    if (feed.length > 60) feed.pop();

    a.state = b.state = 'roam';
    a.partner = b.partner = null;
    releaseVelocity(a); releaseVelocity(b);

    live.done = true;
    renderFeed(); renderTicker(); renderStats(); renderReplay();
    nextMeet = rand(MEET_EVERY[0], MEET_EVERY[1]);
  }

  // ---------- simulation ----------
  function step(dt) {
    for (const h of hounds) {
      h.bob += dt * 5;
      h.glow = Math.max(0, h.glow - dt);

      if (h.state === 'roam') {
        h.vx += rand(-13, 13) * dt;
        h.vy += rand(-13, 13) * dt;
        const sp = Math.hypot(h.vx, h.vy) || 1;
        h.vx = (h.vx / sp) * SPEED; h.vy = (h.vy / sp) * SPEED;
        h.x += h.vx * dt; h.y += h.vy * dt;
        if (h.x < 80) { h.x = 80; h.vx = Math.abs(h.vx); }
        if (h.x > FIELD_W - 80) { h.x = FIELD_W - 80; h.vx = -Math.abs(h.vx); }
        if (h.y < 120) { h.y = 120; h.vy = Math.abs(h.vy); }
        if (h.y > FIELD_H - 80) { h.y = FIELD_H - 80; h.vy = -Math.abs(h.vy); }
        h.flip = h.vx < 0;
      } else if (h.state === 'approach' && h.partner) {
        const mx = (h.x + h.partner.x) / 2, my = (h.y + h.partner.y) / 2;
        const tx = mx + (h.x < h.partner.x ? -58 : 58);
        const dx = tx - h.x, dy = my - h.y, d = Math.hypot(dx, dy) || 1;
        if (d < 5) h.state = 'talk';
        else { h.x += (dx / d) * SPEED * 2.4 * dt; h.y += (dy / d) * SPEED * 2.4 * dt; h.flip = dx < 0; }
      } else if (h.state === 'talk' && h.partner) {
        h.flip = h.x > h.partner.x;
      }
    }

    if (mode === 'demo') {
      if (!live) {
        nextMeet -= dt;
        if (nextMeet <= 0) startDemoEncounter();
      } else if (!live.done && !live.fromApi) {
        if (live.a.state === 'talk' && live.b.state === 'talk') {
          live.t += dt * 1000;
          const want = Math.floor(live.t / TURN_MS);
          if (want > live.i && live.i < live.turns.length - 1) {
            live.i = Math.min(want, live.turns.length - 1);
            renderTheatre();
          } else if (live.i >= live.turns.length - 1 && live.t > TURN_MS * (live.turns.length + 0.6)) {
            resolveDemoEncounter();
            renderTheatre();
            setTimeout(() => { if (live && live.done) { live = null; renderTheatre(); } }, RESULT_HOLD_MS);
          }
        }
      }
    }
    // live mode: encounter state is entirely server-driven via applyLiveEncounter(), nothing to tick here

    if (following && live && !live.done) {
      cam.tx = (live.a.x + live.b.x) / 2;
      cam.ty = (live.a.y + live.b.y) / 2;
      cam.tz = 1.55;
    } else {
      cam.tx = FIELD_W / 2; cam.ty = FIELD_H / 2; cam.tz = 1;
    }
    cam.x += (cam.tx - cam.x) * Math.min(1, dt * 1.5);
    cam.y += (cam.ty - cam.y) * Math.min(1, dt * 1.5);
    cam.z += (cam.tz - cam.z) * Math.min(1, dt * 1.5);
  }

  // ---------- rendering (unchanged visuals) ----------
  const query = () => (el('hound-search').value || '').trim().toLowerCase();

  function drawGrid() {
    const cell = 48;
    ctx.strokeStyle = 'rgba(150, 175, 145, 0.055)';
    ctx.lineWidth = 1 / (baseScale() * cam.z);
    ctx.beginPath();
    for (let x = 0; x <= FIELD_W; x += cell) { ctx.moveTo(x, 0); ctx.lineTo(x, FIELD_H); }
    for (let y = 0; y <= FIELD_H; y += cell) { ctx.moveTo(0, y); ctx.lineTo(FIELD_W, y); }
    ctx.stroke();
  }

  function draw() {
    const s = baseScale() * cam.z;
    ctx.save();
    ctx.fillStyle = '#0a0c0b';
    ctx.fillRect(0, 0, VW, VH);
    ctx.translate(VW / 2, VH / 2);
    ctx.scale(s, s);
    ctx.translate(-cam.x, -cam.y);

    drawGrid();

    ctx.lineWidth = 0.7 / s * 60 * 0.02;
    for (const [p, q] of links) {
      ctx.strokeStyle = 'rgba(140, 170, 210, 0.10)';
      ctx.beginPath();
      ctx.moveTo(p.x, p.y - DOG * 0.35);
      ctx.lineTo(q.x, q.y - DOG * 0.35);
      ctx.stroke();
    }

    if (live && !live.done && live.a.state === 'talk' && live.b.state === 'talk') {
      const mx = (live.a.x + live.b.x) / 2;
      const my = (live.a.y + live.b.y) / 2 - DOG * 0.45;
      const r = Math.max(70, Math.hypot(live.a.x - live.b.x, live.a.y - live.b.y) * 0.62);
      ctx.strokeStyle = 'rgba(240, 176, 60, 0.45)';
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(mx, my, r, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = 'rgba(240, 176, 60, 0.30)';
      ctx.beginPath();
      ctx.moveTo(live.a.x, live.a.y - DOG * 0.45);
      ctx.lineTo(live.b.x, live.b.y - DOG * 0.45);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#f0b03c';
      ctx.font = '11px "IBM Plex Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('BONE ' + eth(live.bone * Math.pow(live.decay, Math.max(0, live.i))) + ' ETH', mx, my - r - 8);
    }

    const q = query();
    const sorted = hounds.slice().sort((p, r) => p.y - r.y);
    for (const h of sorted) {
      const hit = q && h.name.toLowerCase().includes(q);
      const talking = h.state === 'talk';
      const bob = talking ? 0 : Math.round(Math.sin(h.bob)) * PX;
      const x = h.x - DOG / 2;
      const y = h.y - DOG + bob;

      ctx.fillStyle = 'rgba(0,0,0,0.42)';
      ctx.beginPath();
      ctx.ellipse(h.x, h.y + 1, DOG * 0.30, DOG * 0.09, 0, 0, Math.PI * 2);
      ctx.fill();

      if (h.glow > 0 || hit) {
        ctx.save();
        ctx.shadowColor = hit ? '#5ec8e8' : '#7fd58a';
        ctx.shadowBlur = 18;
        window.wcDrawDog(ctx, h.kennel, x, y, PX, h.flip);
        ctx.restore();
      } else {
        window.wcDrawDog(ctx, h.kennel, x, y, PX, h.flip);
      }

      const bx = h.x + DOG * 0.30, by = h.y - DOG * 0.16;
      ctx.fillStyle = 'rgba(226, 230, 220, 0.92)';
      ctx.beginPath(); ctx.arc(bx, by, 8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#14170f';
      ctx.font = '10px "IBM Plex Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(h.badge, bx, by + 0.5);
      ctx.textBaseline = 'alphabetic';

      ctx.font = '11px "IBM Plex Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = talking ? '#e8ead9' : (hit ? '#5ec8e8' : 'rgba(232,234,217,0.62)');
      ctx.fillText(h.name.toUpperCase(), h.x, y - 8);
      if (talking) {
        ctx.fillStyle = 'rgba(232,234,217,0.55)';
        ctx.fillText('IN TALKS', h.x, h.y + 20);
      }
    }
    ctx.restore();
  }

  // ---------- panels ----------
  function renderStats() {
    el('stat-settled').textContent = eth(settledTotal) + ' ETH';
    el('stat-settlements').textContent = Number(settlementCount).toLocaleString('en-US');
    el('stat-hounds').textContent = hounds.length;
  }

  function paintTranscript(turns, upTo, typing, sideB) {
    const list = el('transcript');
    list.innerHTML = '';
    turns.slice(0, upTo + 1).forEach((t, idx) => {
      const li = document.createElement('li');
      li.className = 'turn ' + (t.who === sideB ? 'side-b' : (idx % 2 ? 'side-b' : 'side-a'));
      const sp = document.createElement('p');
      sp.className = 'turn-speaker';
      sp.textContent = t.who ? t.who.name : (t.name || '');
      const tx = document.createElement('p');
      tx.className = 'turn-text' + (idx === upTo && typing ? ' turn-typing' : '');
      tx.textContent = t.text;
      li.append(sp, tx);
      list.appendChild(li);
    });
    list.parentElement.scrollTop = list.parentElement.scrollHeight;
  }

  function renderTheatre() {
    const box = el('theatre');
    if (!live) { box.style.display = 'none'; return; }
    box.style.display = 'block';
    el('theatre-names').innerHTML = live.a.name + ' <span class="theatre-vs">vs</span> ' + live.b.name;
    const badge = el('theatre-badge');
    badge.className = live.done ? (live.deal ? 'badge-done' : 'badge-live') : 'badge-live';
    badge.textContent = live.done ? (live.deal ? 'SETTLED' : 'NO DEAL') : 'LIVE';
    el('theatre-bone').textContent = 'BONE ' + eth(live.bone * Math.pow(live.decay, Math.max(0, live.i))) + ' ETH';
    paintTranscript(live.turns, live.i, !live.done, live.b);
  }

  function renderReplay() {
    const card = el('replay-card');
    const last = feed[0];
    if (!last) { card.style.display = 'none'; return; }
    card.style.display = 'block';
    el('replay-when').textContent = 'REPLAY · ' + ago(last.ts);
    el('replay-who').textContent = last.a + ' vs ' + last.b;
    replay = last;
  }

  function focusHound(name) {
    const h = hounds.find(x => x.name === name);
    if (!h) return;
    following = false;
    const chip = el('follow-chip');
    chip.classList.remove('on');
    chip.querySelector('.camchip-label').textContent = 'FREE CAM';
    cam.tx = h.x; cam.ty = h.y; cam.tz = 1.9;
    h.glow = 2;
  }

  function renderFeed() {
    const list = el('feed-list');
    let rows = feed.slice();
    if (tab === 'biggest') rows = rows.filter(r => r.deal).sort((x, y) => y.amount - x.amount);
    if (tab === 'bones') rows = rows.filter(r => r.deal);
    list.innerHTML = '';
    if (!rows.length) {
      const li = document.createElement('li');
      li.className = 'feed-row';
      li.innerHTML = '<span class="feed-amount feed-nodeal">—</span><span class="dim" style="font-size:12px">Nothing here yet. The yard is warming up.</span><span></span>';
      list.appendChild(li);
      return;
    }
    rows.slice(0, 28).forEach(r => {
      const li = document.createElement('li');
      li.className = 'feed-row';
      const amt = document.createElement('span');
      amt.className = 'feed-amount ' + (r.deal ? 'feed-deal' : 'feed-nodeal');
      amt.textContent = r.deal ? '+' + Number(r.amount).toFixed(5) : 'NO DEAL';
      const body = document.createElement('span');
      const bA = document.createElement('button');
      bA.className = 'linkish'; bA.textContent = r.a; bA.onclick = () => focusHound(r.a);
      const sep = document.createElement('span');
      sep.className = 'dim'; sep.textContent = ' ↔ ';
      const bB = document.createElement('button');
      bB.className = 'linkish'; bB.textContent = r.b; bB.onclick = () => focusHound(r.b);
      body.append(bA, sep, bB);
      const t = document.createElement('span');
      t.className = 'feed-time'; t.textContent = ago(r.ts);
      li.append(amt, body, t);
      list.appendChild(li);
    });
  }

  function renderTicker() {
    const track = el('ticker-track');
    const items = feed.slice(0, 24);
    const html = items.map(r =>
      '<span class="tick ' + (r.deal ? 'deal' : '') + '"><b>' +
      (r.deal ? 'SETTLED ' + Number(r.amount).toFixed(5) + ' ETH' : 'NO DEAL') + '</b> ' +
      short(r.kA) + ' ↔ ' + short(r.kB) + '<i> ' + ago(r.ts) + '</i></span>'
    ).join('');
    track.innerHTML = html ? html + html
      : '<span class="tick"><b>YARD OPEN</b> waiting for the first settlement on Robinhood Chain 4663</span>';
  }

  function renderRecap() {
    const box = el('recap');
    const lastSeen = Number(localStorage.getItem('wc:last') || 0);
    const since = lastSeen ? ago(lastSeen) : 'your first visit';
    el('recap-since').textContent = lastSeen ? 'since ' + since : since;
    localStorage.setItem('wc:last', String(Date.now()));
    box.style.display = 'block';
  }

  // ---------- controls ----------
  el('follow-chip').addEventListener('click', function () {
    following = !following;
    this.classList.toggle('on', following);
    this.querySelector('.camchip-label').textContent = following ? 'FOLLOWING' : 'FREE CAM';
  });

  document.querySelectorAll('.rail-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.rail-tab').forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      tab = btn.dataset.tab;
      renderFeed();
    });
  });

  el('rail-collapse').addEventListener('click', function () {
    const rail = el('rail');
    rail.classList.toggle('collapsed');
    this.textContent = rail.classList.contains('collapsed') ? '▾' : '▴';
  });

  el('hound-search').addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    const h = hounds.find(x => x.name.toLowerCase().includes(query()));
    if (h) focusHound(h.name);
  });

  el('toggle-ui').addEventListener('click', function () {
    const hero = el('hero-layer');
    hero.classList.toggle('hidden');
    this.textContent = hero.classList.contains('hidden') ? 'Show intro' : 'Hide intro';
  });

  el('replay-card').addEventListener('click', () => {
    if (!replay) return;
    live = {
      a: { name: replay.a }, b: { name: replay.b },
      turns: replay.turns, i: replay.turns.length - 1, done: true,
      deal: replay.deal, bone: replay.turns.length ? replay.amount : 0, decay: DECAY,
      fromApi: false
    };
    el('theatre').style.display = 'block';
    el('theatre-names').innerHTML = replay.a + ' <span class="theatre-vs">vs</span> ' + replay.b;
    const badge = el('theatre-badge');
    badge.className = replay.deal ? 'badge-done' : 'badge-live';
    badge.textContent = replay.deal ? 'SETTLED' : 'NO DEAL';
    el('theatre-bone').textContent = 'BONE ' + eth(replay.amount) + ' ETH';
    paintTranscript(replay.turns, replay.turns.length - 1, false, null);
    setTimeout(() => { live = null; renderTheatre(); }, 12000);
  });

  el('recap-close').addEventListener('click', () => { el('recap').style.display = 'none'; });

  function openModal(id) { el(id).classList.add('open'); }
  function closeModals() { document.querySelectorAll('.modal-back').forEach(m => m.classList.remove('open')); }
  document.querySelectorAll('[data-open]').forEach(b => b.addEventListener('click', () => openModal(b.dataset.open)));
  document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', closeModals));
  document.querySelectorAll('.modal-back').forEach(m =>
    m.addEventListener('click', e => { if (e.target === m) closeModals(); }));
  window.addEventListener('keydown', e => { if (e.key === 'Escape') closeModals(); });

  canvas.addEventListener('click', e => {
    const rect = canvas.getBoundingClientRect();
    const s = baseScale() * cam.z;
    const wx = (e.clientX - rect.left - VW / 2) / s + cam.x;
    const wy = (e.clientY - rect.top - VH / 2) / s + cam.y;
    let best = null, bd = 46;
    for (const h of hounds) {
      const d = Math.hypot(h.x - wx, (h.y - DOG * 0.4) - wy);
      if (d < bd) { bd = d; best = h; }
    }
    if (best) focusHound(best.name);
  });

  // ---------- boot ----------
  const brand = el('brand-sprite');
  if (brand) brand.appendChild(window.wcDogCanvas('woofcash', 2));
  window.wcSetFavicon();

  resize();
  renderStats();
  renderFeed();
  renderTicker();
  renderRecap();
  updateSourcePill();
  el('theatre').style.display = 'none';
  el('replay-card').style.display = 'none';

  pollApi();
  setInterval(pollApi, window.WC_API_POLL_MS || 4000);
  setInterval(() => {
    if (feed[0]) el('replay-when').textContent = 'REPLAY · ' + ago(feed[0].ts);
  }, 15000);

  let last = performance.now();
  (function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    step(dt);
    draw();
    requestAnimationFrame(loop);
  })(performance.now());
})();
