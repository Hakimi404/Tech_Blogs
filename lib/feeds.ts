import Parser from "rss-parser";
import { site } from "./site";
import type { Lang } from "./i18n";
import { sectionIds, sourcesFor, type SectionId, type Source } from "./sources";

export type Story = {
  id: string;
  title: string;
  link: string;
  source: string;
  section: SectionId;
  specialist: boolean;
  published: string;
  excerpt: string;
  image?: string;
  hn?: { points: number; comments: number; discussion: string };
};

export type Cluster = {
  id: string;
  lead: Story;
  related: Story[];
  section: SectionId;
  publishers: string[];
  score: number;
  isDeal: boolean;
};

export type SectionEdition = { id: SectionId; clusters: Cluster[]; storyCount: number };

export type Edition = {
  generatedAt: string;
  frontPage: Cluster[];
  sections: SectionEdition[];
  wire: Story[];
  storyCount: number;
  activeSources: string[];
  failedSources: string[];
};

type FeedItem = {
  title?: string;
  link?: string;
  guid?: string;
  isoDate?: string;
  pubDate?: string;
  content?: string;
  contentSnippet?: string;
  summary?: string;
  comments?: string;
  contentEncoded?: string;
  enclosure?: { url?: string; type?: string };
  mediaContent?: { $?: { url?: string; medium?: string; type?: string } }[];
  mediaThumbnail?: { $?: { url?: string } } | { $?: { url?: string } }[];
  mediaGroup?: { "media:content"?: { $?: { url?: string } }[] };
};

const parser: Parser<object, FeedItem> = new Parser({
  customFields: {
    item: [
      ["media:content", "mediaContent", { keepArray: true }],
      ["media:thumbnail", "mediaThumbnail"],
      ["media:group", "mediaGroup"],
      ["content:encoded", "contentEncoded"],
      "comments",
    ],
  },
});

const HOUR = 3_600_000;

const AI_PATTERN =
  /\b(artificial intelligence|machine learning|deep learning|LLMs?|GPT-?\w*|ChatGPT|OpenAI|Anthropic|Claude|Gemini|DeepMind|Copilot|chatbots?|generative|Llama|Mistral|Grok|xAI|Perplexity|Midjourney|Sora|AGI|superintelligence|neural net\w*|foundation models?|large language models?|künstliche Intelligenz|Sprachmodell\w*|maschinelles Lernen)\b/i;
const AI_ACRONYM = /\b(A\.?I|KI)\b/; // case-sensitive: "AI" in English, "KI" in German
// German terms included for the German edition. JS \b only knows ASCII letters, so no boundary sits next to an umlaut.
const SECURITY_PATTERN =
  /\b(ransomware|malware|spyware|botnet|phishing|zero-day|0-day|vulnerabilit(y|ies)|exploit(s|ed)?|CVE-\d+|data breach|breach(ed)?|hack(ed|ers?|ing)?|cyberattacks?|cybersecurity|infostealer|backdoor|Sicherheitslücke\w*|Lücke\w*|Schwachstelle\w*|Cyberangriff\w*|Hackerangriff\w*|Datenleck\w*|gehackt|Trojaner|Sicherheitsupdate\w*|Patchday)\b/i;
// Affiliate coupon pages (e.g. "Nike Promo Codes: 30% Off") are not news and are dropped entirely.
const JUNK_PATTERN = /\b(promo codes?|coupon codes?|coupons|Gutschein\w*)\b/i;
const DEAL_PATTERN =
  /\b(deals?|% off|save \$|discount(ed)?|coupons?|lowest price|on sale|Prime Day|Black Friday|Cyber Monday|promo codes?|Angebot\w*|Blitzangebot\w*|Rabatt\w*|Schnäppchen|Tiefstpreis\w*|Bestpreis\w*|günstig wie nie|reduziert)\b/i;

const STOPWORDS = new Set(
  (
    "the a an and or but for nor of on in at to by with from into onto over under about after before as is are was were be been being " +
    "it its this that these those their there they them he she his her you your we our us i me my not no yes new now just more most " +
    "than then so if how why what when where who whom which will would can could should may might must has have had do does did " +
    "says said say report reports reportedly launches launch launched announces announced update updates out up off its it's here " +
    "first one two three get gets got make makes made via amid against all any some also still back week today day year years " +
    // German
    "der die das den dem des ein eine einen einem einer eines und oder aber für mit von vom zum zur bei nach über unter vor " +
    "durch gegen ohne bis seit ist sind war waren wird werden wurde wurden hat haben hatte kann können soll sollen muss müssen " +
    "will wollen nicht kein keine auch noch nur schon jetzt mehr neue neuer neues neuen ersten wie was wer wann warum sich sein " +
    "seine ihre ihr sie wir man als dass heute alle alles diese dieser dieses gibt bringt macht kommt startet zeigt erhält " +
    "rückt näher bald endlich offiziell"
  ).split(" "),
);

function decodeEntities(text: string): string {
  return text
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&nbsp;/g, " ")
    .replace(/&hellip;/g, "…")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&rsquo;|&lsquo;/g, "’")
    .replace(/&rdquo;|&ldquo;/g, "”")
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function stripHtml(html: string): string {
  return decodeEntities(html.replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ").replace(/<[^>]+>/g, " "));
}

function clean(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function makeExcerpt(item: FeedItem, title: string): string {
  const raw = item.contentSnippet || item.summary || stripHtml(item.contentEncoded || item.content || "");
  let text = clean(decodeEntities(raw))
    .replace(/(The post .+? appeared first on|Der Beitrag .+? erschien zuerst auf) .+?\.?$/i, "")
    .replace(/\b(Continue reading|Read more|Read the full story|Weiterlesen|Zum Artikel)\b.*$/i, "")
    .replace(/\[(…|\.\.\.|&#8230;)\]\s*$/, "")
    .trim();
  if (!text || text.toLowerCase().startsWith(title.toLowerCase().slice(0, 40))) {
    text = text.slice(title.length).trim();
  }
  if (text.length <= 230) return text;
  const cut = text.slice(0, 230);
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:.\-–—]+$/, "") + "…";
}

function firstUrl(...candidates: (string | undefined)[]): string | undefined {
  for (const url of candidates) {
    if (!url || !/^https?:\/\//.test(url)) continue;
    if (/feedburner|pixel|gravatar|\/1x1|tracking|doubleclick|\.gif(\?|$)/i.test(url)) continue;
    return url.replace(/^http:/, "https:");
  }
}

function findImage(item: FeedItem): string | undefined {
  const thumbs = Array.isArray(item.mediaThumbnail) ? item.mediaThumbnail : [item.mediaThumbnail];
  const media = (item.mediaContent ?? []).filter((m) => !m.$?.medium || m.$.medium === "image" || m.$?.type?.startsWith("image"));
  const html = item.contentEncoded || item.content || "";
  const inlineImg = html.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1];
  return firstUrl(
    item.enclosure?.type?.startsWith("image") || /\.(jpe?g|png|webp)/i.test(item.enclosure?.url ?? "") ? item.enclosure?.url : undefined,
    ...media.map((m) => m.$?.url),
    ...(item.mediaGroup?.["media:content"] ?? []).map((m) => m.$?.url),
    ...thumbs.map((t) => t?.$?.url),
    inlineImg && decodeEntities(inlineImg),
  );
}

function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    return (u.hostname.replace(/^www\./, "") + u.pathname.replace(/\/+$/, "")).toLowerCase();
  } catch {
    return url;
  }
}

function fileUnder(source: Source, title: string): SectionId {
  if (source.specialist) return source.section;
  if (AI_ACRONYM.test(title) || AI_PATTERN.test(title)) return "ai";
  if (SECURITY_PATTERN.test(title)) return "security";
  return source.section;
}

async function fetchSource(source: Source, now: number): Promise<Story[]> {
  const res = await fetch(source.url, {
    headers: {
      "User-Agent": `Mozilla/5.0 (compatible; TechBlogsBot/1.0; +${site.github})`,
      Accept: "application/rss+xml, application/atom+xml, application/xml;q=0.9, text/xml;q=0.8, */*;q=0.5",
    },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const feed = await parser.parseString(await res.text());

  const stories: Story[] = [];
  for (const item of feed.items) {
    const title = clean(decodeEntities(item.title ?? ""));
    const link = item.link?.trim();
    const time = Date.parse(item.isoDate ?? item.pubDate ?? "");
    if (!title || !link || Number.isNaN(time) || JUNK_PATTERN.test(title)) continue;
    if (now - time > site.windowHours * HOUR || time - now > HOUR) continue;

    const story: Story = {
      id: "",
      title,
      link,
      source: source.name,
      section: fileUnder(source, title),
      specialist: !!source.specialist,
      published: new Date(Math.min(time, now)).toISOString(),
      excerpt: makeExcerpt(item, title),
      image: findImage(item),
    };

    if (source.name === "Hacker News") {
      const body = item.content ?? "";
      story.hn = {
        points: Number(body.match(/Points:\s*(\d+)/)?.[1] ?? 0),
        comments: Number(body.match(/# Comments:\s*(\d+)/)?.[1] ?? 0),
        discussion: item.comments ?? link,
      };
      story.excerpt = "";
    }
    stories.push(story);
  }
  return stories;
}

/** Merges the same article found in several feeds (e.g. TechCrunch's AI feed and its main feed, or a Hacker News link). */
function dedupe(stories: Story[]): Story[] {
  const byUrl = new Map<string, Story>();
  for (const story of stories) {
    const key = normalizeUrl(story.link);
    const existing = byUrl.get(key);
    if (!existing) {
      byUrl.set(key, story);
      continue;
    }
    const [keep, drop] = existing.source === "Hacker News" && story.source !== "Hacker News" ? [story, existing] : [existing, story];
    keep.hn ??= drop.hn;
    keep.image ??= drop.image;
    keep.excerpt ||= drop.excerpt;
    if (drop.specialist && !keep.specialist) {
      keep.section = drop.section;
      keep.specialist = true;
    }
    byUrl.set(key, keep);
  }
  return [...byUrl.values()];
}

function tokenize(title: string): string[] {
  const words = title
    .toLowerCase()
    .replace(/[’'`]s\b/g, "")
    .replace(/[’'`]/g, "")
    .split(/[^\p{L}\p{N}.+#&]+/u) // Unicode letters, so German words with umlauts stay whole
    .map((w) => w.replace(/^[.\-]+|[.\-]+$/g, ""))
    .filter((w) => (w.length > 2 || /\d/.test(w)) && !STOPWORDS.has(w))
    .map((w) => (w.length > 4 && w.endsWith("s") && !w.endsWith("ss") ? w.slice(0, -1) : w));
  return [...new Set(words)];
}

/** Groups headlines from different outlets that describe the same event, using IDF-weighted word overlap. */
function cluster(stories: Story[]): Story[][] {
  const tokens = stories.map((s) => tokenize(s.title));
  const df = new Map<string, number>();
  for (const set of tokens) for (const t of set) df.set(t, (df.get(t) ?? 0) + 1);
  const idf = (t: string) => Math.log(stories.length / (df.get(t) ?? 1));
  const weight = tokens.map((set) => set.reduce((sum, t) => sum + idf(t), 0));

  const similarity = (a: number, b: number) => {
    const setB = new Set(tokens[b]);
    const shared = tokens[a].filter((t) => setB.has(t));
    if (shared.length < 2) return 0;
    const sharedWeight = shared.reduce((sum, t) => sum + idf(t), 0);
    // Dice coefficient over IDF weights: both headlines must be mostly about the shared words.
    return (2 * sharedWeight) / (weight[a] + weight[b]);
  };

  const order = stories.map((_, i) => i).sort((a, b) => stories[a].published.localeCompare(stories[b].published));
  const groups: number[][] = [];
  const deals: number[][] = []; // shopping posts stand alone so they can't attract real news
  for (const i of order) {
    if (DEAL_PATTERN.test(stories[i].title)) {
      deals.push([i]);
      continue;
    }
    let best: number[] | undefined;
    let bestScore = 0.3;
    for (const group of groups) {
      // Two pieces from one publisher are usually different stories (e.g. a review and a deal), so never group them.
      if (group.some((j) => stories[j].source === stories[i].source)) continue;
      // Average-link: a headline must match the group as a whole, which stops loosely related stories chaining together.
      const score = group.reduce((sum, j) => sum + similarity(i, j), 0) / group.length;
      if (score > bestScore) [best, bestScore] = [group, score];
    }
    if (best) best.push(i);
    else groups.push([i]);
  }
  return [...groups, ...deals].map((g) => g.map((i) => stories[i]));
}

function leadOf(group: Story[]): Story {
  const quality = (s: Story) => (s.image ? 2 : 0) + (s.excerpt ? 1 : 0) + (s.source === "Hacker News" ? -1 : 0) + (s.specialist ? 0.5 : 0);
  return [...group].sort((a, b) => quality(b) - quality(a) || a.published.localeCompare(b.published))[0];
}

function toCluster(group: Story[], now: number): Cluster {
  const lead = leadOf(group);
  const publishers = [...new Set(group.map((s) => s.source))];
  const votes = new Map<SectionId, number>();
  for (const s of group) votes.set(s.section, (votes.get(s.section) ?? 0) + (s.specialist ? 1.5 : 1));
  const section = [...votes.entries()].sort((a, b) => b[1] - a[1] || (a[0] === lead.section ? -1 : 1))[0][0];

  const latest = Math.max(...group.map((s) => Date.parse(s.published)));
  const hoursAgo = (now - latest) / HOUR;
  const points = Math.max(0, ...group.map((s) => s.hn?.points ?? 0));
  const isDeal = DEAL_PATTERN.test(lead.title);

  const score =
    (publishers.filter((p) => p !== "Hacker News").length - 1) * 3 +
    (points ? Math.min(4, Math.max(0, Math.log2(points / 50))) : 0) +
    Math.max(0, (site.windowHours - hoursAgo) / 8) +
    (lead.image ? 0.5 : 0) +
    (section === "ai" ? 0.75 : 0) -
    (isDeal ? 4 : 0);

  return {
    id: lead.id,
    lead,
    related: group.filter((s) => s !== lead).sort((a, b) => a.published.localeCompare(b.published)),
    section,
    publishers,
    score,
    isDeal,
  };
}

// Short-lived memo so dev reloads and back-to-back regenerations don't refetch 40 feeds; far shorter than the
// page's revalidate interval so it never holds an edition back.
const MEMO_MS = 120_000;
const memo = new Map<Lang, { at: number; edition: Promise<Edition> }>();

/** The edition for one language: the English edition reads English sources, the German edition German ones. */
export function getEdition(lang: Lang): Promise<Edition> {
  const cached = memo.get(lang);
  if (cached && Date.now() - cached.at < MEMO_MS) return cached.edition;
  const edition = buildEdition(lang);
  memo.set(lang, { at: Date.now(), edition });
  edition.catch(() => memo.delete(lang));
  return edition;
}

async function buildEdition(lang: Lang): Promise<Edition> {
  const now = Date.now();
  const sources = sourcesFor(lang);
  const results = await Promise.allSettled(sources.map((s) => fetchSource(s, now)));

  const failed = new Set<string>();
  const active = new Set<string>();
  results.forEach((r, i) => {
    if (r.status === "fulfilled") active.add(sources[i].name);
    else {
      failed.add(sources[i].name);
      console.warn(`[feeds] ${sources[i].name} (${sources[i].url}) failed: ${r.reason}`);
    }
  });

  const stories = dedupe(results.flatMap((r) => (r.status === "fulfilled" ? r.value : [])));
  stories.sort((a, b) => b.published.localeCompare(a.published));
  stories.forEach((s, i) => (s.id = `s${i}`));

  const clusters = cluster(stories)
    .map((g) => toCluster(g, now))
    .sort((a, b) => b.score - a.score);

  const frontPage = clusters.filter((c) => !c.isDeal).slice(0, 5);
  const onFront = new Set(frontPage.map((c) => c.id));

  return {
    generatedAt: new Date(now).toISOString(),
    frontPage,
    sections: sectionIds
      .map((id) => {
        const inSection = clusters.filter((c) => c.section === id);
        return {
          id,
          clusters: inSection.filter((c) => !onFront.has(c.id)),
          storyCount: inSection.reduce((n, c) => n + 1 + c.related.length, 0),
        };
      })
      .filter((s) => s.storyCount > 0),
    wire: stories.slice(0, 14),
    storyCount: stories.length,
    // A publisher counts as active if any of its feeds answered.
    activeSources: [...active],
    failedSources: [...failed].filter((name) => !active.has(name)),
  };
}
