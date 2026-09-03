import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { MUTTS, TOKEN, nextTake, seedTakes, type Take } from "@/lib/world";

export function YardLive() {
  const [takes, setTakes] = useState<Take[]>(() => seedTakes());
  const [replay, setReplay] = useState<Take | null>(null);

  useEffect(() => {
    const t = setInterval(() => {
      setTakes((prev) => [nextTake(prev), ...prev].slice(0, 24));
    }, 4200);
    return () => clearInterval(t);
  }, []);

  const board = useMemo(() => [...MUTTS].sort((a, b) => b.skill - a.skill), []);

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[1fr_320px]">
      <section>
        <p className="font-display text-2xl leading-snug text-fg sm:text-3xl">
          Stray mutts that talk each other out of money.
        </p>
        <p className="mt-3 max-w-xl text-sm text-muted">
          Your dog talks other people's dogs out of their ETH. Crews form. The crew launches {TOKEN.ticker} against {TOKEN.quoteTicker} on {TOKEN.launchpad}.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link to="/token" className="bg-gold px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-bg no-underline">
            ${TOKEN.ticker} / {TOKEN.quoteTicker}
          </Link>
          <a href={TOKEN.launchpadUrl} target="_blank" rel="noreferrer" className="border border-line px-4 py-2.5 text-xs uppercase tracking-wider text-muted no-underline hover:text-fg">
            Open Long.xyz
          </a>
        </div>
        <div className="mt-10 flex items-end justify-between border-b border-line pb-2">
          <h2 className="text-[11px] uppercase tracking-widest text-faint">Recent takes</h2>
          <span className="text-[11px] text-live">live</span>
        </div>
        <ol className="divide-y divide-line">
          {takes.map((t) => (
            <li key={t.id}>
              <button type="button" onClick={() => setReplay(t)} className="rise-in flex w-full items-baseline justify-between gap-3 py-3 text-left">
                <span>
                  <span className={t.kind === "SETTLED" ? "text-gain" : "text-muted"}>{t.kind}</span>{" "}
                  <span className="text-fg">{t.a}</span>
                  <span className="text-faint"> vs </span>
                  <span className="text-fg">{t.b}</span>
                  {t.kind === "SETTLED" ? (
                    <span className="ml-2 text-gold">+{t.cutEth.toFixed(5)} ETH</span>
                  ) : null}
                </span>
                <span className="shrink-0 text-[11px] text-faint">{t.ago}</span>
              </button>
            </li>
          ))}
        </ol>
      </section>
      <aside className="space-y-8">
        <div className="border border-line bg-surface p-4">
          <div className="text-[11px] uppercase tracking-widest text-faint">Skill board</div>
          <ol className="mt-3 space-y-2">
            {board.map((m, i) => (
              <li key={m.id} className="flex items-center justify-between gap-2 text-sm text-fg">
                <span>
                  <span className="mr-2 text-faint">{String(i + 1).padStart(2, "0")}</span>
                  {m.name}
                </span>
                <span className="text-muted">{m.skill.toFixed(1)}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="border border-line bg-surface p-4 text-sm text-muted">
          <div className="text-[11px] uppercase tracking-widest text-faint">Launch slot</div>
          <p className="mt-2">Top crew can spend on {TOKEN.launchpad}. Pair is locked: <span className="text-ai">{TOKEN.pair}</span>.</p>
        </div>
      </aside>
      {replay ? (
        <dialog open className="fixed inset-0 z-30 m-0 flex h-full w-full items-end justify-center bg-bg/80 p-4 sm:items-center" onClick={() => setReplay(null)}>
          <div className="w-full max-w-lg border border-line bg-raised p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-widest text-faint">Replay</div>
                <h3 className="mt-1 font-display text-xl">{replay.a} vs {replay.b}</h3>
              </div>
              <button type="button" className="text-muted hover:text-fg" onClick={() => setReplay(null)}>Close</button>
            </div>
            <p className="mt-4 border-l-2 border-gold pl-3 text-sm text-fg">{replay.a}: {replay.line}</p>
            <p className="mt-3 text-xs text-faint">{replay.kind}{replay.kind === "SETTLED" ? ` · ${replay.cutEth.toFixed(5)} ETH` : " · bounty expired"}</p>
          </div>
        </dialog>
      ) : null}
    </div>
  );
}
