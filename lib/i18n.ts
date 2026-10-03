import type { SectionId } from "./sources";

export const langs = ["en", "de"] as const;
export type Lang = (typeof langs)[number];
export const defaultLang: Lang = "en";

export function isLang(value: string): value is Lang {
  return (langs as readonly string[]).includes(value);
}

/** Picks the reader's language from a saved choice, then from the browser's Accept-Language header. */
export function pickLang(saved: string | undefined, acceptLanguage: string | null): Lang {
  if (saved && isLang(saved)) return saved;
  const preferred = (acceptLanguage ?? "")
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { lang: tag.slice(0, 2).toLowerCase(), q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q)
    .find((p) => isLang(p.lang));
  return (preferred?.lang as Lang | undefined) ?? defaultLang;
}

export const LANG_COOKIE = "lang";

type SectionCopy = { title: string; short: string; kicker: string };

export type Dictionary = {
  dateLocale: string;
  metaTitle: string;
  metaDescription: (sources: number, author: string) => string;
  tagline: string;
  compiledBy: string;
  volume: string;
  number: string;
  updated: string;
  frontPage: string;
  sourcesNav: string;
  sections: Record<SectionId, SectionCopy>;
  topStory: string;
  reportedBy: (outlets: number) => string;
  outlets: (outlets: number) => string;
  alsoIn: string;
  hn: (points: number, comments: number) => string;
  wireTitle: string;
  wireSub: string;
  numbersLabel: string;
  storiesFrom: string;
  newsroomsIn: (hours: number) => string;
  storyCount: (stories: number) => string;
  showMore: (stories: number, section: SectionCopy) => string;
  showFewer: string;
  sectionEmpty: string;
  quietTitle: string;
  quietBody: string;
  footerAbout: (sources: number, hours: number) => string;
  refreshed: (minutes: number) => string;
  sourceCode: string;
  unavailable: string;
  colophon: (year: number, author: string) => string;
  theme: { light: string; dark: string; toggle: string };
  language: string;
};

const en: Dictionary = {
  dateLocale: "en-US",
  metaTitle: "Tech Blogs — The last 24 hours in AI & tech",
  metaDescription: (sources, author) =>
    `Everything that happened in AI & technology in the last 24 hours. A daily front page compiled from ${sources} newsrooms, labs and blogs by ${author}.`,
  tagline: "The last 24 hours in AI & technology",
  compiledBy: "Compiled by",
  volume: "Vol.",
  number: "No.",
  updated: "Updated",
  frontPage: "Front Page",
  sourcesNav: "Sources",
  sections: {
    ai: { title: "Artificial Intelligence", short: "AI", kicker: "Models, labs & research" },
    industry: { title: "Industry", short: "Industry", kicker: "Business, policy & big tech" },
    gadgets: { title: "Gadgets & Hardware", short: "Gadgets & Hardware", kicker: "Devices, chips & EVs" },
    security: { title: "Security", short: "Security", kicker: "Breaches, exploits & privacy" },
    developers: { title: "Developers", short: "Developers", kicker: "Code, tools & open source" },
  },
  topStory: "Top story",
  reportedBy: (n) => `reported by ${n} outlets`,
  outlets: (n) => `${n} outlets`,
  alsoIn: "Also in",
  hn: (points, comments) => `▲ ${points} pts · ${comments} comments`,
  wireTitle: "The Wire",
  wireSub: "Latest headlines, as they land",
  numbersLabel: "Today in numbers",
  storiesFrom: "stories from",
  newsroomsIn: (hours) => `newsrooms in the past ${hours} hours`,
  storyCount: (n) => (n === 1 ? "1 story" : `${n} stories`),
  showMore: (n, section) => `Show ${n} more ${section.short === "AI" ? "AI" : section.short.toLowerCase()} stories`,
  showFewer: "Show fewer",
  sectionEmpty: "This section's biggest stories are on the front page above.",
  quietTitle: "The wires are quiet.",
  quietBody: "We couldn't reach any of our sources just now. The presses restart automatically — check back in a few minutes.",
  footerAbout: (sources, hours) =>
    `A daily front page of everything that happened in AI and technology over the last ${hours} hours, gathered from ${sources} newsrooms, research labs and engineering blogs. Stories reported by several outlets are grouped together and rise to the top.`,
  refreshed: (minutes) => `Refreshed every ${minutes} minutes.`,
  sourceCode: "Source on GitHub",
  unavailable: "(unavailable)",
  colophon: (year, author) =>
    `© ${year} ${author}. Headlines and excerpts belong to their publishers — every story links to the original.`,
  theme: { light: "Light", dark: "Dark", toggle: "Switch between light and dark mode" },
  language: "Language",
};

const de: Dictionary = {
  dateLocale: "de-DE",
  metaTitle: "Tech Blogs — Die letzten 24 Stunden in KI & Technik",
  metaDescription: (sources, author) =>
    `Alles, was in den letzten 24 Stunden in KI & Technologie passiert ist. Eine tägliche Titelseite aus ${sources} Redaktionen, Laboren und Blogs, zusammengestellt von ${author}.`,
  tagline: "Die letzten 24 Stunden in KI & Technologie",
  compiledBy: "Zusammengestellt von",
  volume: "Jg.",
  number: "Nr.",
  updated: "Aktualisiert",
  frontPage: "Titelseite",
  sourcesNav: "Quellen",
  sections: {
    ai: { title: "Künstliche Intelligenz", short: "KI", kicker: "Modelle, Labore & Forschung" },
    industry: { title: "Branche", short: "Branche", kicker: "Wirtschaft, Politik & Big Tech" },
    gadgets: { title: "Gadgets & Hardware", short: "Gadgets & Hardware", kicker: "Geräte, Chips & E-Autos" },
    security: { title: "Sicherheit", short: "Sicherheit", kicker: "Lücken, Angriffe & Datenschutz" },
    developers: { title: "Entwickler", short: "Entwickler", kicker: "Code, Tools & Open Source" },
  },
  topStory: "Topthema",
  reportedBy: (n) => `berichtet von ${n} Medien`,
  outlets: (n) => `${n} Medien`,
  alsoIn: "Auch bei",
  hn: (points, comments) => `▲ ${points} Punkte · ${comments} Kommentare`,
  wireTitle: "Der Ticker",
  wireSub: "Die neuesten Schlagzeilen, sobald sie eintreffen",
  numbersLabel: "Der Tag in Zahlen",
  storiesFrom: "Meldungen aus",
  newsroomsIn: (hours) => `Redaktionen in den letzten ${hours} Stunden`,
  storyCount: (n) => (n === 1 ? "1 Meldung" : `${n} Meldungen`),
  showMore: (n) => `${n} weitere Meldungen anzeigen`,
  showFewer: "Weniger anzeigen",
  sectionEmpty: "Die wichtigsten Meldungen dieser Rubrik stehen oben auf der Titelseite.",
  quietTitle: "Die Leitungen sind still.",
  quietBody:
    "Gerade ist keine unserer Quellen erreichbar. Die Seite aktualisiert sich automatisch – schau in ein paar Minuten wieder vorbei.",
  footerAbout: (sources, hours) =>
    `Eine tägliche Titelseite mit allem, was in den letzten ${hours} Stunden in KI und Technologie passiert ist – aus ${sources} Redaktionen, Forschungslaboren und Tech-Blogs. Meldungen, über die mehrere Medien berichten, werden gebündelt und rücken nach oben.`,
  refreshed: (minutes) => `Wird alle ${minutes} Minuten aktualisiert.`,
  sourceCode: "Quellcode auf GitHub",
  unavailable: "(nicht erreichbar)",
  colophon: (year, author) =>
    `© ${year} ${author}. Schlagzeilen und Auszüge gehören den jeweiligen Verlagen – jede Meldung verlinkt auf das Original.`,
  theme: { light: "Hell", dark: "Dunkel", toggle: "Zwischen hellem und dunklem Modus wechseln" },
  language: "Sprache",
};

export const dictionaries: Record<Lang, Dictionary> = { en, de };
