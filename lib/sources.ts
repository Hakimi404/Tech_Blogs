import type { Lang } from "./i18n";

export type SectionId = "ai" | "industry" | "gadgets" | "security" | "developers";

/** Display order of the sections; their titles live in lib/i18n.ts. */
export const sectionIds: SectionId[] = ["ai", "industry", "gadgets", "security", "developers"];

export type Source = {
  name: string;
  url: string;
  section: SectionId;
  /** Which edition the source appears in: the English edition uses English sources, the German edition German ones. */
  lang: Lang;
  /** Specialist sources keep their section; general ones are re-filed by keyword (e.g. an AI story on The Verge goes to AI). */
  specialist?: boolean;
};

// Several publishers appear twice (a topic feed + the main feed). Stories found in both are merged by URL.
export const sources: Source[] = [
  // ——— English edition ———

  // Artificial intelligence
  { lang: "en", name: "OpenAI", url: "https://openai.com/news/rss.xml", section: "ai", specialist: true },
  { lang: "en", name: "Google AI", url: "https://blog.google/technology/ai/rss/", section: "ai", specialist: true },
  { lang: "en", name: "Google DeepMind", url: "https://deepmind.google/blog/rss.xml", section: "ai", specialist: true },
  { lang: "en", name: "Hugging Face", url: "https://huggingface.co/blog/feed.xml", section: "ai", specialist: true },
  { lang: "en", name: "NVIDIA", url: "https://blogs.nvidia.com/feed/", section: "ai", specialist: true },
  { lang: "en", name: "AWS Machine Learning", url: "https://aws.amazon.com/blogs/machine-learning/feed/", section: "ai", specialist: true },
  { lang: "en", name: "MIT Technology Review", url: "https://www.technologyreview.com/topic/artificial-intelligence/feed", section: "ai", specialist: true },
  { lang: "en", name: "The Decoder", url: "https://the-decoder.com/feed/", section: "ai", specialist: true },
  { lang: "en", name: "Simon Willison", url: "https://simonwillison.net/atom/everything/", section: "ai", specialist: true },
  { lang: "en", name: "TechCrunch", url: "https://techcrunch.com/category/artificial-intelligence/feed/", section: "ai", specialist: true },
  { lang: "en", name: "The Verge", url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml", section: "ai", specialist: true },
  { lang: "en", name: "Ars Technica", url: "https://arstechnica.com/ai/feed/", section: "ai", specialist: true },

  // Industry
  { lang: "en", name: "TechCrunch", url: "https://techcrunch.com/feed/", section: "industry" },
  { lang: "en", name: "The Verge", url: "https://www.theverge.com/rss/index.xml", section: "industry" },
  { lang: "en", name: "Ars Technica", url: "https://feeds.arstechnica.com/arstechnica/index", section: "industry" },
  { lang: "en", name: "Wired", url: "https://www.wired.com/feed/rss", section: "industry" },
  { lang: "en", name: "The Guardian", url: "https://www.theguardian.com/uk/technology/rss", section: "industry" },
  { lang: "en", name: "BBC Technology", url: "https://feeds.bbci.co.uk/news/technology/rss.xml", section: "industry" },
  { lang: "en", name: "The Register", url: "https://www.theregister.com/headlines.atom", section: "industry" },
  { lang: "en", name: "ZDNET", url: "https://www.zdnet.com/news/rss.xml", section: "industry" },
  { lang: "en", name: "The Next Web", url: "https://thenextweb.com/feed", section: "industry" },
  { lang: "en", name: "Fast Company", url: "https://www.fastcompany.com/technology/rss", section: "industry" },
  { lang: "en", name: "Crunchbase News", url: "https://news.crunchbase.com/feed/", section: "industry" },
  { lang: "en", name: "Gizmodo", url: "https://gizmodo.com/feed", section: "industry" },

  // Gadgets & hardware
  { lang: "en", name: "Engadget", url: "https://www.engadget.com/rss.xml", section: "gadgets" },
  { lang: "en", name: "CNET", url: "https://www.cnet.com/rss/news/", section: "gadgets" },
  { lang: "en", name: "Tom's Hardware", url: "https://www.tomshardware.com/feeds/all", section: "gadgets" },
  { lang: "en", name: "9to5Mac", url: "https://9to5mac.com/feed/", section: "gadgets" },
  { lang: "en", name: "9to5Google", url: "https://9to5google.com/feed/", section: "gadgets" },
  { lang: "en", name: "Mashable", url: "https://mashable.com/feeds/rss/tech", section: "gadgets" },
  { lang: "en", name: "Electrek", url: "https://electrek.co/feed/", section: "gadgets" },
  { lang: "en", name: "IEEE Spectrum", url: "https://spectrum.ieee.org/feeds/feed.rss", section: "gadgets" },

  // Security
  { lang: "en", name: "The Hacker News", url: "https://feeds.feedburner.com/TheHackersNews", section: "security", specialist: true },
  { lang: "en", name: "BleepingComputer", url: "https://www.bleepingcomputer.com/feed/", section: "security", specialist: true },
  { lang: "en", name: "Krebs on Security", url: "https://krebsonsecurity.com/feed/", section: "security", specialist: true },
  { lang: "en", name: "Dark Reading", url: "https://www.darkreading.com/rss.xml", section: "security", specialist: true },

  // Developers
  { lang: "en", name: "Hacker News", url: "https://hnrss.org/frontpage?points=100", section: "developers" },
  { lang: "en", name: "GitHub Blog", url: "https://github.blog/feed/", section: "developers" },
  { lang: "en", name: "InfoQ", url: "https://feed.infoq.com/", section: "developers" },
  { lang: "en", name: "Stack Overflow Blog", url: "https://stackoverflow.blog/feed/", section: "developers" },

  // ——— German edition ———

  // Künstliche Intelligenz
  { lang: "de", name: "The Decoder", url: "https://the-decoder.de/feed/", section: "ai", specialist: true },

  // Branche
  { lang: "de", name: "heise online", url: "https://www.heise.de/rss/heise-atom.xml", section: "industry" },
  { lang: "de", name: "Golem", url: "https://rss.golem.de/rss.php?feed=ATOM1.0", section: "industry" },
  { lang: "de", name: "t3n", url: "https://t3n.de/rss.xml", section: "industry" },
  { lang: "de", name: "Spiegel Netzwelt", url: "https://www.spiegel.de/netzwelt/index.rss", section: "industry" },
  { lang: "de", name: "ZEIT Digital", url: "https://newsfeed.zeit.de/digital/index", section: "industry" },
  { lang: "de", name: "Süddeutsche Digital", url: "https://rss.sueddeutsche.de/rss/Digital", section: "industry" },
  { lang: "de", name: "netzpolitik.org", url: "https://netzpolitik.org/feed/", section: "industry" },
  { lang: "de", name: "Gründerszene", url: "https://www.businessinsider.de/gruenderszene/feed/", section: "industry" },
  { lang: "de", name: "deutsche-startups.de", url: "https://www.deutsche-startups.de/feed/", section: "industry" },
  { lang: "de", name: "Basic Thinking", url: "https://www.basicthinking.de/blog/feed/", section: "industry" },

  // Gadgets & Hardware
  { lang: "de", name: "ComputerBase", url: "https://www.computerbase.de/rss/news.xml", section: "gadgets" },
  { lang: "de", name: "WinFuture", url: "https://static.winfuture.de/feeds/WinFuture-News-rss2.0.xml", section: "gadgets" },
  { lang: "de", name: "Caschys Blog", url: "https://stadt-bremerhaven.de/feed/", section: "gadgets" },
  { lang: "de", name: "PC Games Hardware", url: "https://www.pcgameshardware.de/feed.cfm", section: "gadgets" },
  { lang: "de", name: "iphone-ticker.de", url: "https://www.iphone-ticker.de/feed/", section: "gadgets" },
  { lang: "de", name: "ifun.de", url: "https://www.ifun.de/feed/", section: "gadgets" },
  { lang: "de", name: "Mobiflip", url: "https://www.mobiflip.de/feed/", section: "gadgets" },
  { lang: "de", name: "Dr. Windows", url: "https://www.drwindows.de/news/feed", section: "gadgets" },
  { lang: "de", name: "electrive", url: "https://www.electrive.net/feed/", section: "gadgets" },

  // Sicherheit
  { lang: "de", name: "heise online", url: "https://www.heise.de/security/rss/news-atom.xml", section: "security", specialist: true },
  { lang: "de", name: "Security-Insider", url: "https://www.security-insider.de/rss/news.xml", section: "security", specialist: true },
  { lang: "de", name: "Borns IT- und Windows-Blog", url: "https://www.borncity.com/blog/feed/", section: "security" },

  // Entwickler
  { lang: "de", name: "heise online", url: "https://www.heise.de/developer/rss/news-atom.xml", section: "developers", specialist: true },
  { lang: "de", name: "Linux-Magazin", url: "https://www.linux-magazin.de/feed/", section: "developers" },
];

export function sourcesFor(lang: Lang): Source[] {
  return sources.filter((s) => s.lang === lang);
}

/** One entry per publisher (a publisher may have several feeds). */
export function publishersFor(lang: Lang): string[] {
  return [...new Set(sourcesFor(lang).map((s) => s.name))];
}
