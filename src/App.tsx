import { useEffect, useState, type ReactNode } from "react";
import { loadBundle } from "./data";
import type { Bundle, Coin, World } from "./types";

const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

function yearLabel(y?: number): string {
  if (y === undefined) return "";
  return y < 0 ? `${-y} BC` : `AD ${y}`;
}

/** Minimal hash router: "" = home, else a world id. */
function useRoute(): string {
  const [hash, setHash] = useState(() => (typeof window !== "undefined" ? window.location.hash : ""));
  useEffect(() => {
    const on = () => setHash(window.location.hash);
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return hash.replace(/^#\/?/, "");
}

export function App() {
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [failed, setFailed] = useState(false);
  const route = useRoute();

  useEffect(() => {
    loadBundle().then(setBundle).catch(() => setFailed(true));
  }, []);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [route]);

  if (failed) return <main className="wrap"><p className="loading">The cabinet is closed for the moment.</p></main>;
  if (!bundle) return <main className="wrap"><p className="loading">Unlocking the cabinet…</p></main>;

  const [worldId, coinId] = route.split("/");
  const world = bundle.worlds.find((w) => w.id === worldId);
  if (world && coinId) {
    const coin = world.coins.find((c) => c.id === coinId);
    if (coin) return <CoinPage bundle={bundle} world={world} coin={coin} />;
  }
  return world ? <WorldPage bundle={bundle} world={world} /> : <Home bundle={bundle} />;
}

/* ---------------- Home / splash ---------------- */

function Home({ bundle }: { bundle: Bundle }) {
  const years = bundle.worlds.flatMap((w) => w.coins.map((c) => c.dateSort).filter((y): y is number => y !== undefined));
  const span = Math.max(...years) - Math.min(...years);
  return (
    <div className="page fade">
      <header className="hero">
        <div className="hero-inner">
          <p className="kicker">The collection of a lifetime, told as a story</p>
          <h1 className="wordmark">Numistoria</h1>
          <p className="lede">
            {bundle.stats.owned} coins across {bundle.stats.worlds} worlds — from a Judaean prutah of{" "}
            {yearLabel(Math.min(...years))} to {yearLabel(Math.max(...years))}. Each world is a chapter;
            each coin, a page.
          </p>
          <div className="figures">
            <Figure n={String(bundle.stats.worlds)} k="Worlds" />
            <Figure n={String(bundle.stats.owned)} k="Coins held" />
            <Figure n={span.toLocaleString()} sub="yrs" k="Spanned" />
            <Figure n={String(bundle.stats.wishlist)} k="In pursuit" />
          </div>
          <Progress owned={bundle.stats.owned} total={bundle.stats.owned + bundle.stats.wishlist} />
          <div className="scroll-cue" aria-hidden="true">↓</div>
        </div>
      </header>

      <section className="gallery-wrap" aria-label="The worlds">
        <p className="section-eyebrow">Choose a world</p>
        <h2 className="section-title">Seven halls, one story</h2>
        <div className="gallery">
          {bundle.worlds.map((w, i) => (
            <WorldCard key={w.id} world={w} n={i + 1} />
          ))}
        </div>
      </section>
      <Footer bundle={bundle} />
    </div>
  );
}

function WorldCard({ world, n }: { world: World; n: number }) {
  const owned = world.coins.filter((c) => c.status === "owned").length;
  const wish = world.coins.filter((c) => c.status === "wishlist").length;
  const preview = world.coins.slice(0, 5);
  const bg = world.cover?.url
    ? { backgroundImage: `linear-gradient(rgba(22,17,10,0.88), rgba(22,17,10,0.965)), url(${world.cover.url})`, backgroundSize: "cover", backgroundPosition: "center" }
    : undefined;
  return (
    <a className="world-card" href={`#/${world.id}`} style={bg}>
      <div className="wc-coins">
        {preview.map((c, i) => (
          <span className="wc-coin" style={{ zIndex: preview.length - i }} key={c.id}>
            <Medallion coin={c} small />
          </span>
        ))}
      </div>
      <p className="wc-num">Chapter {ROMAN[n]}</p>
      <h3>{world.name}</h3>
      {world.tagline ? <p className="wc-tag">{world.tagline}</p> : null}
      <p className="wc-meta">
        {world.era ? `${world.era.from}–${world.era.to}` : ""}
        {wish ? ` · ${wish} sought` : ""}
      </p>
      <Progress owned={owned} total={world.coins.length} subtle />
      <span className="wc-enter">Enter the hall →</span>
    </a>
  );
}

/* ---------------- A single world ---------------- */

function WorldPage({ bundle, world }: { bundle: Bundle; world: World }) {
  const idx = bundle.worlds.findIndex((w) => w.id === world.id);
  const prev = bundle.worlds[idx - 1];
  const next = bundle.worlds[idx + 1];
  const owned = world.coins.filter((c) => c.status === "owned");
  const wish = world.coins.filter((c) => c.status === "wishlist");
  return (
    <div className="page fade">
      <div className="topbar">
        <a className="back" href="#/">← Numistoria</a>
        <span className="topbar-ch">Chapter {ROMAN[idx + 1]} of {bundle.worlds.length}</span>
      </div>

      {world.cover?.url ? (
        <div className="hall-hero" style={{ backgroundImage: `url(${world.cover.url})` }}>
          <div className="hall-hero-scrim">
            <p className="eyebrow">
              {world.era ? <>{world.era.from}–{world.era.to}</> : null}
              {world.regions.length ? <> · {world.regions.join(" · ")}</> : null}
            </p>
            <h2 id="ch-t">{world.name}</h2>
            {world.tagline ? <p className="tagline">{world.tagline}</p> : null}
          </div>
        </div>
      ) : null}
      <section className="chapter" aria-labelledby={world.cover?.url ? undefined : "ch-t"}>
        <div className="chapter-head">
          {!world.cover?.url ? (
            <>
              <p className="eyebrow">
                {world.era ? <>{world.era.from}–{world.era.to}</> : null}
                {world.regions.length ? <> · {world.regions.join(" · ")}</> : null}
              </p>
              <h2 id="ch-t">{world.name}</h2>
              {world.tagline ? <p className="tagline">{world.tagline}</p> : null}
            </>
          ) : null}
          {world.intro ? <p className="intro">{world.intro}</p> : null}
          <Progress owned={owned.length} total={world.coins.length} />
        </div>
        <div className="reel">
          {owned.map((c) => (
            <CoinEntry key={c.id} coin={c} worldId={world.id} />
          ))}
        </div>
        {wish.length ? (
          <div className="stillhunting">
            <h3 className="sh-title">Still hunting <span>· {wish.length} slots to fill</span></h3>
            <p className="sh-note">The reserved chapters — coins sought to complete this world, cheapest wins first.</p>
            <div className="wishgrid">
              {wish.map((c) => (
                <WishCard key={c.id} coin={c} worldId={world.id} />
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <nav className="worldnav" aria-label="Between worlds">
        {prev ? (
          <a className="wn wn-prev" href={`#/${prev.id}`}>
            <span className="wn-dir">← Previous</span>
            <span className="wn-name">{prev.name}</span>
          </a>
        ) : <span />}
        {next ? (
          <a className="wn wn-next" href={`#/${next.id}`}>
            <span className="wn-dir">Next →</span>
            <span className="wn-name">{next.name}</span>
          </a>
        ) : <span />}
      </nav>
      <Footer bundle={bundle} />
    </div>
  );
}

/* ---------------- Shared bits ---------------- */

function Figure({ n, sub, k }: { n: string; sub?: string; k: string }) {
  return (
    <div className="figure">
      <div className="fn">{n}{sub ? <small>{sub}</small> : null}</div>
      <div className="fk">{k}</div>
    </div>
  );
}

function Progress({ owned, total, subtle }: { owned: number; total: number; subtle?: boolean }) {
  const pct = total ? Math.round((owned / total) * 100) : 0;
  return (
    <div className={`progress ${subtle ? "subtle" : ""}`}>
      <div className="progress-label"><span>{owned} of {total} acquired</span><span>{pct}%</span></div>
      <div className="progress-track"><i style={{ width: `${pct}%` }} /></div>
    </div>
  );
}

function WishCard({ coin, worldId }: { coin: Coin; worldId: string }) {
  const meta = [coin.authority, coin.date, coin.denomination, coin.metal].filter(Boolean).join(" · ");
  return (
    <a className={`wishcard ${coin.ambitious ? "whale" : ""}`} href={`#/${worldId}/${coin.id}`}>
      <Medallion coin={coin} small />
      <div className="wishcard-body">
        <h4>{coin.name}{coin.ambitious ? <span className="whale-badge">★ white whale</span> : null}</h4>
        {meta ? <p className="wish-meta">{meta}</p> : null}
        {coin.story?.body ? <p className="wish-why">{coin.story.body}</p> : null}
        <span className="wish-more">Read its story →</span>
      </div>
    </a>
  );
}

function initials(c: Coin): string {
  return (c.authority || c.name)
    .split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

function Medallion({ coin, small }: { coin: Coin; small?: boolean }) {
  const img = coin.images?.obverse;
  const wishlist = coin.status === "wishlist";
  if (img?.url) {
    return <img className={`medallion ${small ? "sm" : ""}`} src={img.url} alt={img.alt ?? coin.name} loading="lazy" />;
  }
  return (
    <svg className={`medallion ${small ? "sm" : ""} ${wishlist ? "ghost" : ""}`} viewBox="0 0 100 100" role="img" aria-label={coin.name}>
      <circle cx="50" cy="50" r="46" className="med-face" />
      <circle cx="50" cy="50" r="39" className="med-ring" />
      <text x="50" y="53" textAnchor="middle" dominantBaseline="middle" className="med-initials">{initials(coin)}</text>
      {!small ? <text x="50" y="82" textAnchor="middle" className="med-sub">{wishlist ? "sought" : coin.date ?? ""}</text> : null}
    </svg>
  );
}

function CoinEntry({ coin, worldId }: { coin: Coin; worldId: string }) {
  const wishlist = coin.status === "wishlist";
  const meta = [coin.authority, coin.date, coin.denomination, coin.metal, coin.mint].filter(Boolean).join(" · ");
  return (
    <a className={`coin ${wishlist ? "wish" : ""}`} href={`#/${worldId}/${coin.id}`}>
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
        {coin.deepDive ? <span className="coin-more">Enter the exhibit →</span> : null}
      </div>
    </a>
  );
}

/* ---------------- A single coin: the exhibit ---------------- */

function CoinPage({ bundle, world, coin }: { bundle: Bundle; world: World; coin: Coin }) {
  const wishlist = coin.status === "wishlist";
  const chapter = bundle.worlds.findIndex((w) => w.id === world.id) + 1;
  const ordered = [...world.coins].sort((a, b) => a.order - b.order);
  const pos = ordered.findIndex((c) => c.id === coin.id);
  const prev = ordered[pos - 1];
  const next = ordered[pos + 1];
  const dd = coin.deepDive;
  const specs: [string, string][] = [
    coin.denomination ? ["Denomination", coin.denomination] : null,
    coin.metal ? ["Metal", coin.metal] : null,
    coin.authority ? ["Authority", coin.authority] : null,
    coin.date ? ["Date", coin.date] : null,
    coin.mint ? ["Mint", coin.mint] : null,
    coin.diameterMm ? ["Diameter", `${coin.diameterMm} mm`] : null,
    coin.weightG ? ["Weight", `${coin.weightG} g`] : null,
    coin.reference ? ["Reference", coin.reference] : null,
  ].filter(Boolean) as [string, string][];

  return (
    <div className="page fade">
      <div className="topbar">
        <a className="back" href="#/">← Numistoria</a>
        <span className="topbar-ch">
          <a href={`#/${world.id}`}>{world.name}</a> · Chapter {ROMAN[chapter]}
        </span>
      </div>

      <div className={`coinhero ${coin.header?.url ? "" : "noimg"}`} style={coin.header?.url ? { backgroundImage: `url(${coin.header.url})` } : undefined}>
        <div className="coinhero-scrim">
          <p className="eyebrow">
            <span className={`status-pill ${wishlist ? "sought" : "held"}`}>{wishlist ? "Still hunting" : "In the collection"}</span>
            {coin.ambitious ? <span className="whale-badge">★ white whale</span> : null}
          </p>
          <h1 id="coin-t">{coin.name}</h1>
          {coin.story?.hook ? <p className="coin-hook">{coin.story.hook}</p> : null}
        </div>
      </div>

      <article className="exhibit">
        {/* The object */}
        <section className="ex-object">
          <div className="ex-faces">
            {coin.images?.obverse?.url || coin.images?.reverse?.url ? (
              <>
                {coin.images?.obverse?.url ? <img src={coin.images.obverse.url} alt={coin.images.obverse.alt ?? `${coin.name} obverse`} /> : null}
                {coin.images?.reverse?.url ? <img src={coin.images.reverse.url} alt={coin.images.reverse.alt ?? `${coin.name} reverse`} /> : null}
              </>
            ) : (
              <div className="ex-nophoto">
                <Medallion coin={coin} />
                <p>{wishlist ? "Not yet acquired — no photograph." : "Photograph being added."}</p>
              </div>
            )}
          </div>
          {specs.length ? (
            <dl className="specstrip">
              {specs.map(([k, v]) => (
                <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
              ))}
            </dl>
          ) : null}
        </section>

        {dd?.whyItMatters ? <p className="ex-why">{dd.whyItMatters}</p> : null}

        {coin.story?.body ? <Block title="The story">{coin.story.body}</Block> : null}
        {dd?.theYear ? <Block title="The year it was struck">{dd.theYear}</Block> : null}
        {dd?.whoIsOnIt ? <Block title="Who is on it">{dd.whoIsOnIt}</Block> : null}
        {dd?.howToRead ? <Block title="How to read this coin">{dd.howToRead}</Block> : null}
        {dd?.metalAndMaking ? <Block title="Metal & making">{dd.metalAndMaking}</Block> : null}

        {dd?.inTheSources?.length ? (
          <section className="ex-block">
            <h2>In the sources</h2>
            <div className="quotes">
              {dd.inTheSources.map((q, i) => (
                <blockquote key={i}>
                  <p>“{q.text}”</p>
                  <cite>{q.attribution}</cite>
                  {q.note ? <p className="q-note">{q.note}</p> : null}
                </blockquote>
              ))}
            </div>
            <p className="draft-note">Quotations are AI-drafted from public-domain texts and being verified against the sources below.</p>
          </section>
        ) : null}

        {dd?.cautions ? (
          <section className="ex-block cautions">
            <h2>Look-alikes & cautions</h2>
            <p>{dd.cautions}</p>
          </section>
        ) : null}

        {/* Collector's note */}
        <section className="ex-block collector">
          <h2>{wishlist ? "The hunt" : "In the collection"}</h2>
          {wishlist ? (
            <p>A reserved chapter — sought to complete <a href={`#/${world.id}`}>{world.name}</a>. {coin.ambitious ? "This is the world's white whale: the aspirational piece the whole arc points toward." : "Cheapest, story-fitting wins are pursued first."}</p>
          ) : (
            <p>Part of the collection.{coin.certification ? ` Certified by ${coin.certification.service}${coin.certification.grade ? ` (${coin.certification.grade})` : ""}.` : ""} Any condition notes are photo-based observations — never a grade or authentication.</p>
          )}
        </section>

        {/* Place in the arc */}
        <section className="ex-block arc">
          <h2>Place in the arc</h2>
          <div className="arc-nav">
            {prev ? (
              <a href={`#/${world.id}/${prev.id}`} className="arc-link">
                <span className="arc-dir">← Before</span><span className="arc-name">{prev.name}</span>
              </a>
            ) : <span />}
            {next ? (
              <a href={`#/${world.id}/${next.id}`} className="arc-link arc-next">
                <span className="arc-dir">After →</span><span className="arc-name">{next.name}</span>
              </a>
            ) : <span />}
          </div>
        </section>

        {/* Go deeper */}
        {coin.references?.length ? (
          <section className="ex-block godeeper">
            <h2>Go deeper</h2>
            <ul className="reflist">
              {coin.references.map((r) => (
                <li key={r.key}>
                  <a href={r.url} target="_blank" rel="noopener noreferrer">{r.label}</a>
                  <span className={`ref-kind ${r.kind}`}>{r.kind}</span>
                  {r.note ? <p className="ref-note">{r.note}</p> : null}
                </li>
              ))}
            </ul>
            <p className="draft-note">Links point to reputable databases, museum collections and primary texts. Specific catalogue numbers and attributions are verified before they’re shown.</p>
          </section>
        ) : null}
      </article>

      <Footer bundle={bundle} />
    </div>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="ex-block">
      <h2>{title}</h2>
      <p>{children}</p>
    </section>
  );
}

function Footer({ bundle }: { bundle: Bundle }) {
  const d = new Date(bundle.generatedAt);
  return (
    <footer className="foot">
      <p>
        <strong>Numistoria</strong> — a personal collection, told as a story. Narratives are written
        with Claude from the recorded facts of each coin and its era; hall backdrops are AI-rendered
        from historical prompts; coin photography is being added piece by piece, with placeholders
        until each is in hand.
      </p>
      <p className="fine">Last updated {d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}.</p>
    </footer>
  );
}
