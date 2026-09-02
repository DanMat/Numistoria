import { useEffect, useState } from "react";
import { loadBundle } from "./data";
import type { Bundle, Coin, World } from "./types";

const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

function yearLabel(y?: number): string {
  if (y === undefined) return "";
  return y < 0 ? `${-y} BC` : `AD ${y}`;
}

export function App() {
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    loadBundle().then(setBundle).catch(() => setFailed(true));
  }, []);

  if (failed) return <main className="wrap"><p className="loading">The cabinet is closed for the moment.</p></main>;
  if (!bundle) return <main className="wrap"><p className="loading">Unlocking the cabinet…</p></main>;

  return (
    <>
      <Hero bundle={bundle} />
      <Index worlds={bundle.worlds} />
      <main>
        {bundle.worlds.map((w, i) => (
          <Chapter key={w.id} world={w} n={i + 1} />
        ))}
      </main>
      <Footer bundle={bundle} />
    </>
  );
}

function Hero({ bundle }: { bundle: Bundle }) {
  const years = bundle.worlds.flatMap((w) => w.coins.map((c) => c.dateSort).filter((y): y is number => y !== undefined));
  const min = Math.min(...years);
  const max = Math.max(...years);
  const span = max - min;
  return (
    <header className="hero">
      <div className="hero-inner">
        <p className="kicker">The collection of a lifetime, told as a story</p>
        <h1 className="wordmark">Numistoria</h1>
        <p className="lede">
          {bundle.stats.owned} coins across {bundle.stats.worlds} worlds — from a Judaean prutah of{" "}
          {yearLabel(min)} to {yearLabel(max)}. Each world is a chapter; each coin, a page. Read in
          order, they tell one continuous history in metal.
        </p>
        <div className="figures">
          <Figure n={String(bundle.stats.worlds)} k="Worlds" />
          <Figure n={String(bundle.stats.owned)} k="Coins held" />
          <Figure n={`${span.toLocaleString()}`} sub="yrs" k="Spanned" />
          <Figure n={String(bundle.stats.wishlist)} k="In pursuit" />
        </div>
        <div className="scroll-cue" aria-hidden="true">↓</div>
      </div>
    </header>
  );
}

function Figure({ n, sub, k }: { n: string; sub?: string; k: string }) {
  return (
    <div className="figure">
      <div className="fn">{n}{sub ? <small>{sub}</small> : null}</div>
      <div className="fk">{k}</div>
    </div>
  );
}

function Index({ worlds }: { worlds: World[] }) {
  return (
    <nav className="index" aria-label="Chapters">
      <ol>
        {worlds.map((w, i) => (
          <li key={w.id}>
            <a href={`#${w.id}`}>
              <span className="idx-n">{ROMAN[i + 1]}</span>
              <span className="idx-t">{w.name}</span>
              {w.era ? <span className="idx-e">{w.era.from}–{w.era.to}</span> : null}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function Chapter({ world, n }: { world: World; n: number }) {
  return (
    <section className="chapter" id={world.id} aria-labelledby={`${world.id}-t`}>
      <div className="chapter-head">
        <p className="eyebrow">
          Chapter {ROMAN[n]}
          {world.era ? <> · {world.era.from}–{world.era.to}</> : null}
          {world.regions.length ? <> · {world.regions.join(" · ")}</> : null}
        </p>
        <h2 id={`${world.id}-t`}>{world.name}</h2>
        {world.tagline ? <p className="tagline">{world.tagline}</p> : null}
        {world.intro ? <p className="intro">{world.intro}</p> : null}
      </div>
      <div className="reel">
        {world.coins.map((c) => (
          <CoinEntry key={c.id} coin={c} />
        ))}
      </div>
    </section>
  );
}

function initials(c: Coin): string {
  return (c.authority || c.name)
    .split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

function Medallion({ coin }: { coin: Coin }) {
  const img = coin.images?.obverse;
  const wishlist = coin.status === "wishlist";
  if (img?.url) {
    return <img className="medallion" src={img.url} alt={img.alt ?? coin.name} loading="lazy" />;
  }
  return (
    <svg className={`medallion ${wishlist ? "ghost" : ""}`} viewBox="0 0 100 100" role="img" aria-label={coin.name}>
      <circle cx="50" cy="50" r="46" className="med-face" />
      <circle cx="50" cy="50" r="39" className="med-ring" />
      <text x="50" y="53" textAnchor="middle" dominantBaseline="middle" className="med-initials">{initials(coin)}</text>
      <text x="50" y="82" textAnchor="middle" className="med-sub">{wishlist ? "sought" : coin.date ?? ""}</text>
    </svg>
  );
}

function CoinEntry({ coin }: { coin: Coin }) {
  const wishlist = coin.status === "wishlist";
  const meta = [coin.authority, coin.date, coin.denomination, coin.metal, coin.mint].filter(Boolean).join(" · ");
  return (
    <article className={`coin ${wishlist ? "wish" : ""}`}>
      <div className="coin-figure">
        <Medallion coin={coin} />
        {wishlist ? <span className="ribbon">Still hunting</span> : null}
      </div>
      <div className="coin-body">
        <h3>{coin.name}</h3>
        {meta ? <p className="coin-meta">{meta}</p> : null}
        {coin.story?.hook ? <p className="hook">{coin.story.hook}</p> : null}
        {coin.story?.body ? <p className="story">{coin.story.body}</p> : null}
        {!coin.story?.body && coin.grade ? <p className="story">{coin.grade}</p> : null}
      </div>
    </article>
  );
}

function Footer({ bundle }: { bundle: Bundle }) {
  const d = new Date(bundle.generatedAt);
  return (
    <footer className="foot">
      <p>
        <strong>Numistoria</strong> — a personal collection, told as a story. Narratives are written
        with Claude from the recorded facts of each coin and its era; coin photography is being added
        piece by piece, with placeholders until each is in hand.
      </p>
      <p className="fine">Last updated {d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}.</p>
    </footer>
  );
}
