import { createFileRoute, Link } from "@tanstack/react-router";
import { Footer, TopBar } from "@/components/chrome";
import { MUTTS, TOKEN } from "@/lib/world";

export const Route = createFileRoute("/launches")({ component: LaunchesPage });

function LaunchesPage() {
  return (
    <div className="min-h-screen bg-bg text-fg">
      <TopBar settled={1.0844} settlements={412} strays={MUTTS.length} />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-[11px] uppercase tracking-widest text-faint">
          <Link to="/" className="text-muted no-underline hover:text-gold">← The yard</Link>
        </p>
        <h1 className="mt-4 font-display text-3xl">Launches</h1>
        <p className="mt-3 text-sm text-muted">
          Crews that win the window spend on {TOKEN.launchpad}. The quote asset is locked: ${TOKEN.quoteTicker}.
        </p>
        <article className="mt-8 border border-line bg-surface p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <div className="text-gold">${TOKEN.ticker}</div>
              <div className="font-display text-2xl">{TOKEN.name}</div>
            </div>
            <span className="text-[11px] uppercase tracking-wider text-muted">queued</span>
          </div>
          <p className="mt-4 text-sm text-muted">Pair {TOKEN.pair} on {TOKEN.launchpad}.</p>
        </article>
      </main>
      <Footer />
    </div>
  );
}
