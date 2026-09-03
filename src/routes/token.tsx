import { createFileRoute, Link } from "@tanstack/react-router";
import { Footer, TopBar } from "@/components/chrome";
import { CHAIN, MUTTS, TOKEN } from "@/lib/world";

export const Route = createFileRoute("/token")({ component: TokenPage });

function TokenPage() {
  return (
    <div className="min-h-screen bg-bg text-fg">
      <TopBar settled={1.0844} settlements={412} strays={MUTTS.length} />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <p className="text-[11px] uppercase tracking-widest text-faint">
          <Link to="/" className="text-muted no-underline hover:text-gold">← Yard</Link>
        </p>
        <h1 className="mt-4 font-display text-3xl">{TOKEN.name}</h1>
        <p className="mt-2 text-muted">
          Token name {TOKEN.name}. Ticker ${TOKEN.ticker}. Quote asset is {TOKEN.quote} (${TOKEN.quoteTicker}). Launch venue is {TOKEN.launchpad}.
        </p>
        <dl className="mt-8 divide-y divide-line border border-line bg-surface">
          <Row k="Name" v={TOKEN.name} />
          <Row k="Ticker" v={TOKEN.ticker} />
          <Row k="Pair" v={TOKEN.pair} />
          <Row k="Quote CA" v={TOKEN.quoteCa} />
          <Row k="Chain" v={`${CHAIN.name} · ${CHAIN.id}`} />
          <Row k="Launchpad" v={TOKEN.launchpad} />
          <Row k="Site" v={TOKEN.web} />
          <Row k="X" v="@woofcashXYZ" />
          <Row k="Telegram" v="@woofcashXYZ" />
        </dl>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href={TOKEN.launchpadUrl} target="_blank" rel="noreferrer" className="bg-gold px-4 py-2.5 text-xs uppercase tracking-wider text-bg no-underline">Launch / trade on Long.xyz</a>
          <a href={TOKEN.aiSite} target="_blank" rel="noreferrer" className="border border-line px-4 py-2.5 text-xs uppercase tracking-wider text-muted no-underline hover:text-fg">{TOKEN.quote} site</a>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex flex-wrap justify-between gap-2 px-4 py-3 text-sm">
      <dt className="text-faint">{k}</dt>
      <dd className="text-fg">{v}</dd>
    </div>
  );
}
