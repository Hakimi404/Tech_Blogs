import { getEdition, type SectionEdition } from "@/lib/feeds";
import { site } from "@/lib/site";
import { sections as allSections, sources } from "@/lib/sources";
import { EditionDate, EditionRefresher, TimeAgo } from "./components/client";
import { ColumnStory, CompactStory, FeaturedStory, LeadStory, SecondaryStory, Wire } from "./components/stories";

// Re-fetch every feed and rebuild the front page every 15 minutes (site.refreshSeconds).
export const revalidate = 900;

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
const VISIBLE_PER_SECTION = 9;

function issueOf(generatedAt: string) {
  const days = Math.floor((Date.parse(generatedAt) - Date.parse(site.launchDate)) / 86_400_000);
  return { volume: ROMAN[Math.floor(Math.max(0, days) / 365)] ?? "X+", number: Math.max(0, days) + 1 };
}

function SectionBlock({ edition, index, serverNow }: { edition: SectionEdition; index: number; serverNow: string }) {
  const { section, clusters, storyCount } = edition;
  // Feature the strongest story that has artwork; the rest run in columns.
  const featuredIndex = Math.max(0, clusters.slice(0, 4).findIndex((c) => c.lead.image));
  const featured = clusters[featuredIndex];
  const rest = clusters.filter((_, i) => i !== featuredIndex);
  const columns = rest.slice(0, VISIBLE_PER_SECTION - 1);
  const more = rest.slice(VISIBLE_PER_SECTION - 1);

  return (
    <section id={section.id} className="section" aria-labelledby={`${section.id}-title`}>
      <header className="section-head">
        <span className="section-number">{String(index + 1).padStart(2, "0")}</span>
        <div>
          <h2 id={`${section.id}-title`} className="section-title">
            {section.title}
          </h2>
          <p className="section-kicker">{section.kicker}</p>
        </div>
        <p className="section-count">
          {storyCount} {storyCount === 1 ? "story" : "stories"}
        </p>
      </header>

      {featured ? (
        <div className="section-body">
          <FeaturedStory cluster={featured} serverNow={serverNow} />
          {columns.length > 0 && (
            <div className="section-columns">
              {columns.map((c) => (
                <ColumnStory key={c.id} cluster={c} serverNow={serverNow} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <p className="section-empty">This section&apos;s biggest stories are on the front page above.</p>
      )}

      {more.length > 0 && (
        <details className="more">
          <summary>
            <span className="more-open">
              Show {more.length} more {section.title === "Artificial Intelligence" ? "AI" : section.title.toLowerCase()} stories
            </span>
            <span className="more-close">Show fewer</span>
          </summary>
          <ul className="compact-list">
            {more.map((c) => (
              <CompactStory key={c.id} cluster={c} serverNow={serverNow} />
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}

export default async function Home() {
  const edition = await getEdition();
  const serverNow = edition.generatedAt;
  const { volume, number } = issueOf(edition.generatedAt);
  const [lead, ...secondary] = edition.frontPage;
  const publishers = [...new Map(sources.map((s) => [s.name, s])).values()];
  const failed = new Set(edition.failedSources);

  return (
    <>
      <EditionRefresher generatedAt={edition.generatedAt} refreshSeconds={site.refreshSeconds} />

      <header className="masthead">
        <div className="wrap">
          <div className="dateline">
            <span>
              Vol. {volume} · No. {number}
            </span>
            <span className="dateline-date">
              <EditionDate iso={edition.generatedAt} />
            </span>
            <span>
              Updated <TimeAgo iso={edition.generatedAt} serverNow={serverNow} />
            </span>
          </div>
          <h1 className="wordmark">{site.name}</h1>
          <p className="tagline">
            <em>The last 24 hours in AI &amp; technology</em>
            <span className="tagline-rule" aria-hidden />
            Compiled by <strong>{site.author}</strong>
          </p>
        </div>
      </header>

      <nav className="sections-nav" aria-label="Sections">
        <div className="wrap">
          <a href="#top-stories">Front Page</a>
          {edition.sections.map((s) => (
            <a key={s.section.id} href={`#${s.section.id}`}>
              {s.section.id === "ai" ? "AI" : s.section.title}
            </a>
          ))}
          <a href="#sources">Sources</a>
        </div>
      </nav>

      <main className="wrap">
        {lead ? (
          <>
            <section id="top-stories" className="front" aria-label="Top stories">
              <LeadStory cluster={lead} serverNow={serverNow} />
              <div className="secondaries">
                {secondary.map((c, i) => (
                  <SecondaryStory key={c.id} cluster={c} serverNow={serverNow} withImage={i === 0} />
                ))}
              </div>
              <Wire stories={edition.wire} serverNow={serverNow} />
            </section>

            <section className="numbers" aria-label="Today in numbers">
              <div className="numbers-intro">
                <p className="numbers-label">Today in numbers</p>
                <p className="numbers-total">
                  <strong>{edition.storyCount}</strong> stories from <strong>{edition.activeSources.length}</strong> newsrooms in
                  the past {site.windowHours} hours
                </p>
              </div>
              <ul className="numbers-list">
                {edition.sections.map((s) => (
                  <li key={s.section.id}>
                    <a href={`#${s.section.id}`}>
                      <span className="numbers-figure">{s.storyCount}</span>
                      <span className="numbers-name">{s.section.id === "ai" ? "AI" : s.section.title}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>

            {edition.sections.map((s) => (
              <SectionBlock
                key={s.section.id}
                edition={s}
                index={allSections.findIndex((x) => x.id === s.section.id)}
                serverNow={serverNow}
              />
            ))}
          </>
        ) : (
          <section className="quiet">
            <h2>The wires are quiet.</h2>
            <p>We couldn&apos;t reach any of our sources just now. The presses restart automatically — check back in a few minutes.</p>
          </section>
        )}
      </main>

      <footer className="footer" id="sources">
        <div className="wrap">
          <div className="footer-grid">
            <div className="footer-about">
              <p className="footer-wordmark">{site.name}</p>
              <p>
                A daily front page of everything that happened in AI and technology over the last {site.windowHours} hours,
                gathered from {publishers.length} newsrooms, research labs and engineering blogs. Stories reported by several
                outlets are grouped together and rise to the top.
              </p>
              <p>
                Compiled by <strong>{site.author}</strong>. Refreshed every {site.refreshSeconds / 60} minutes.{" "}
                <a href={site.github} target="_blank" rel="noopener noreferrer">
                  Source on GitHub
                </a>
              </p>
            </div>
            <div>
              <h2 className="footer-heading">Sources</h2>
              <ul className="source-list">
                {publishers.map((p) => (
                  <li key={p.name} className={failed.has(p.name) ? "offline" : undefined}>
                    {p.name}
                    {failed.has(p.name) && <span className="offline-note"> (unavailable)</span>}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="colophon">
            © {new Date(edition.generatedAt).getUTCFullYear()} {site.author}. Headlines and excerpts belong to their publishers —
            every story links to the original.
          </p>
        </div>
      </footer>
    </>
  );
}
