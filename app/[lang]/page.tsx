import { notFound } from "next/navigation";
import { getEdition, type SectionEdition } from "@/lib/feeds";
import { dictionaries, isLang } from "@/lib/i18n";
import { site } from "@/lib/site";
import { publishersFor, sectionIds } from "@/lib/sources";
import { EditionDate, EditionRefresher, LanguageSwitch, ThemeToggle, TimeAgo } from "../components/client";
import {
  ColumnStory,
  CompactStory,
  FeaturedStory,
  LeadStory,
  SecondaryStory,
  Wire,
  type Ctx,
} from "../components/stories";

// Re-fetch every feed and rebuild each edition every 15 minutes (site.refreshSeconds).
export const revalidate = 900;

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
const VISIBLE_PER_SECTION = 9;

function issueOf(generatedAt: string) {
  const days = Math.floor((Date.parse(generatedAt) - Date.parse(site.launchDate)) / 86_400_000);
  return { volume: ROMAN[Math.floor(Math.max(0, days) / 365)] ?? "X+", number: Math.max(0, days) + 1 };
}

function SectionBlock({ edition, ctx }: { edition: SectionEdition; ctx: Ctx }) {
  const { id, clusters, storyCount } = edition;
  const copy = ctx.t.sections[id];
  // Feature the strongest story that has artwork; the rest run in columns.
  const featuredIndex = Math.max(0, clusters.slice(0, 4).findIndex((c) => c.lead.image));
  const featured = clusters[featuredIndex];
  const rest = clusters.filter((_, i) => i !== featuredIndex);
  const columns = rest.slice(0, VISIBLE_PER_SECTION - 1);
  const more = rest.slice(VISIBLE_PER_SECTION - 1);

  return (
    <section id={id} className="section" aria-labelledby={`${id}-title`}>
      <header className="section-head">
        <span className="section-number">{String(sectionIds.indexOf(id) + 1).padStart(2, "0")}</span>
        <div>
          <h2 id={`${id}-title`} className="section-title">
            {copy.title}
          </h2>
          <p className="section-kicker">{copy.kicker}</p>
        </div>
        <p className="section-count">{ctx.t.storyCount(storyCount)}</p>
      </header>

      {featured ? (
        <div className="section-body">
          <FeaturedStory cluster={featured} ctx={ctx} />
          {columns.length > 0 && (
            <div className="section-columns">
              {columns.map((c) => (
                <ColumnStory key={c.id} cluster={c} ctx={ctx} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <p className="section-empty">{ctx.t.sectionEmpty}</p>
      )}

      {more.length > 0 && (
        <details className="more">
          <summary>
            <span className="more-open">{ctx.t.showMore(more.length, copy)}</span>
            <span className="more-close">{ctx.t.showFewer}</span>
          </summary>
          <ul className="compact-list">
            {more.map((c) => (
              <CompactStory key={c.id} cluster={c} ctx={ctx} />
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = dictionaries[lang];
  const edition = await getEdition(lang);
  const ctx: Ctx = { serverNow: edition.generatedAt, lang, t };
  const { volume, number } = issueOf(edition.generatedAt);
  const [lead, ...secondary] = edition.frontPage;
  const publishers = publishersFor(lang);
  const failed = new Set(edition.failedSources);

  return (
    <>
      <EditionRefresher generatedAt={edition.generatedAt} refreshSeconds={site.refreshSeconds} />

      <header className="masthead">
        <div className="wrap">
          <div className="dateline">
            <span className="dateline-issue">
              {t.volume} {volume} · {t.number} {number}
              <span className="dateline-updated">
                {" · "}
                {t.updated} <TimeAgo iso={edition.generatedAt} serverNow={ctx.serverNow} lang={lang} />
              </span>
            </span>
            <span className="dateline-date">
              <EditionDate iso={edition.generatedAt} locale={t.dateLocale} />
            </span>
            <div className="controls">
              <LanguageSwitch current={lang} label={t.language} />
              <ThemeToggle label={t.theme.toggle} light={t.theme.light} dark={t.theme.dark} />
            </div>
          </div>
          <h1 className="wordmark">{site.name}</h1>
          <p className="tagline">
            <em>{t.tagline}</em>
            <span className="tagline-rule" aria-hidden />
            {t.compiledBy} <strong>{site.author}</strong>
          </p>
        </div>
      </header>

      <nav className="sections-nav" aria-label={t.frontPage}>
        <div className="wrap">
          <a href="#top-stories">{t.frontPage}</a>
          {edition.sections.map((s) => (
            <a key={s.id} href={`#${s.id}`}>
              {t.sections[s.id].short}
            </a>
          ))}
          <a href="#sources">{t.sourcesNav}</a>
        </div>
      </nav>

      <main className="wrap">
        {lead ? (
          <>
            <section id="top-stories" className="front" aria-label={t.topStory}>
              <LeadStory cluster={lead} ctx={ctx} />
              <div className="secondaries">
                {secondary.map((c, i) => (
                  <SecondaryStory key={c.id} cluster={c} ctx={ctx} withImage={i === 0} />
                ))}
              </div>
              <Wire stories={edition.wire} ctx={ctx} />
            </section>

            <section className="numbers" aria-label={t.numbersLabel}>
              <div className="numbers-intro">
                <p className="numbers-label">{t.numbersLabel}</p>
                <p className="numbers-total">
                  <strong>{edition.storyCount}</strong> {t.storiesFrom} <strong>{edition.activeSources.length}</strong>{" "}
                  {t.newsroomsIn(site.windowHours)}
                </p>
              </div>
              <ul className="numbers-list">
                {edition.sections.map((s) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`}>
                      <span className="numbers-figure">{s.storyCount}</span>
                      <span className="numbers-name">{t.sections[s.id].short}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>

            {edition.sections.map((s) => (
              <SectionBlock key={s.id} edition={s} ctx={ctx} />
            ))}
          </>
        ) : (
          <section className="quiet">
            <h2>{t.quietTitle}</h2>
            <p>{t.quietBody}</p>
          </section>
        )}
      </main>

      <footer className="footer" id="sources">
        <div className="wrap">
          <div className="footer-grid">
            <div className="footer-about">
              <p className="footer-wordmark">{site.name}</p>
              <p>{t.footerAbout(publishers.length, site.windowHours)}</p>
              <p>
                {t.compiledBy} <strong>{site.author}</strong>. {t.refreshed(site.refreshSeconds / 60)}
              </p>
            </div>
            <div>
              <h2 className="footer-heading">{t.sourcesNav}</h2>
              <ul className="source-list">
                {publishers.map((name) => (
                  <li key={name} className={failed.has(name) ? "offline" : undefined}>
                    {name}
                    {failed.has(name) && <span className="offline-note"> {t.unavailable}</span>}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="colophon">{t.colophon(new Date(edition.generatedAt).getUTCFullYear(), site.author)}</p>
        </div>
      </footer>
    </>
  );
}
