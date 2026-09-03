import { Link } from "@tanstack/react-router";
import { CHAIN, TOKEN } from "@/lib/world";

export function TopBar({
  settled,
  settlements,
  strays,
}: {
  settled: number;
  settlements: number;
  strays: number;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="flex items-baseline gap-2 text-fg no-underline">
          <span className="pixel-mark font-display text-lg tracking-wide">WoofCash</span>
          <span className="text-xs text-muted">${TOKEN.ticker}</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-4 text-xs uppercase tracking-wider text-muted">
          <Link to="/" className="hover:text-gold">Yard</Link>
          <Link to="/leaderboard" className="hover:text-gold">Board</Link>
          <Link to="/launches" className="hover:text-gold">Launches</Link>
          <Link to="/logs" className="hover:text-gold">Logs</Link>
          <Link to="/token" className="hover:text-gold">Token</Link>
          <Link to="/about" className="hover:text-gold">Rules</Link>
        </nav>
        <div className="flex items-center gap-3 font-mono text-[11px] text-muted">
          <span className="inline-flex items-center gap-1.5 text-live">
            <span className="live-dot size-1.5 rounded-full bg-live" />
            {CHAIN.name} {CHAIN.id}
          </span>
        </div>
      </div>
      <div className="border-t border-line bg-surface">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px sm:grid-cols-4">
          <Stat k="Settled" v={`${settled.toFixed(4)} ETH`} />
          <Stat k="Settlements" v={String(settlements)} />
          <Stat k="Strays" v={String(strays)} />
          <Stat k="Pair" v={TOKEN.pair} accent />
        </div>
      </div>
    </header>
  );
}

function Stat({ k, v, accent }: { k: string; v: string; accent?: boolean }) {
  return (
    <div className="px-4 py-2.5">
      <div className="text-[10px] uppercase tracking-widest text-faint">{k}</div>
      <div className={accent ? "text-ai" : "text-fg"}>{v}</div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line px-4 py-8 text-center text-[11px] text-faint">
      <div className="mb-4 flex flex-wrap items-center justify-center gap-4 text-xs uppercase tracking-wider">
        <a href={TOKEN.web} className="text-muted no-underline hover:text-gold">woofcash.xyz</a>
        <a href={TOKEN.x} target="_blank" rel="noreferrer" className="text-muted no-underline hover:text-gold">X</a>
        <a href={TOKEN.telegram} target="_blank" rel="noreferrer" className="text-muted no-underline hover:text-gold">Telegram</a>
        <a href={TOKEN.github} target="_blank" rel="noreferrer" className="text-muted no-underline hover:text-gold">GitHub</a>
      </div>
      Experimental software on an experimental chain. Mutts lose money as well as
      win it. Nothing here is investment advice. ${TOKEN.ticker} is not $
      {TOKEN.quoteTicker} and is not NVIDIA equity.
    </footer>
  );
}
