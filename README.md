# Tech Blogs

**The last 24 hours in AI & technology, on one front page.** Compiled by Abdullah Al-Hakimi.

Tech Blogs pulls the latest stories from dozens of newsrooms, AI labs and engineering blogs, keeps only what was published in the past 24 hours, and lays it out like a daily newspaper. When several outlets report the same event, their headlines are grouped together and the story rises toward the top.

The site has two editions:

| Edition | URL | Sources |
| --- | --- | --- |
| **English** | `/en` | 40 English-language newsrooms, labs and blogs |
| **Deutsch** | `/de` | 23 German-language newsrooms and blogs, with the whole interface in German |

Visiting `/` opens the edition matching the reader's browser language. Once a reader picks EN or DE, that choice is remembered.

## Design

The site uses the **Editorial** style from [Tilda's web design styles guide](https://tilda.education/en/web-design-styles), the style meant for magazines, blogs and news outlets. It borrows from print newspapers:

- a masthead with volume, issue number and dateline, set in high-contrast Playfair Display
- Newsreader for body text and IBM Plex Mono for labels and timestamps
- column grids separated by printed rules, drop caps and numbered sections
- a "newsprint" paper texture

**Light and dark mode:** the site follows the system setting until the reader uses the Light/Dark button in the top bar. That choice is saved and applied before the page paints, so the wrong theme never flashes.

## What's on the page

| Part | What it shows |
| --- | --- |
| **Top story + front page** | The 5 most important stories, ranked by how many outlets covered them, Hacker News points, recency and topic |
| **The Wire / Der Ticker** | The latest headlines in the order they were published |
| **Today in numbers / Der Tag in Zahlen** | Story counts for each section |
| **Sections** | AI · Industry · Gadgets & Hardware · Security · Developers |

## Sources

**English:** OpenAI, Google AI, Google DeepMind, Hugging Face, NVIDIA, AWS Machine Learning, MIT Technology Review, The Decoder, Simon Willison, TechCrunch, The Verge, Ars Technica, Wired, The Guardian, BBC Technology, The Register, ZDNET, The Next Web, Fast Company, Crunchbase News, Gizmodo, Engadget, CNET, Tom's Hardware, 9to5Mac, 9to5Google, Mashable, Electrek, IEEE Spectrum, The Hacker News, BleepingComputer, Krebs on Security, Dark Reading, Hacker News, GitHub Blog, InfoQ, Stack Overflow Blog.

**Deutsch:** heise online (incl. Security and Developer), Golem, t3n, Spiegel Netzwelt, ZEIT Digital, Süddeutsche Digital, netzpolitik.org, Gründerszene, deutsche-startups.de, Basic Thinking, The Decoder, ComputerBase, WinFuture, Caschys Blog, PC Games Hardware, iphone-ticker.de, ifun.de, Mobiflip, Dr. Windows, electrive, Security-Insider, Borns IT- und Windows-Blog, Linux-Magazin.

To add or remove a source, edit [`lib/sources.ts`](lib/sources.ts). Any RSS or Atom feed works; set `lang` to choose the edition it appears in.

## How it works

- [`lib/feeds.ts`](lib/feeds.ts) fetches every feed of an edition in parallel, keeps the last 24 hours, and merges copies of the same URL that appear in several feeds. It moves AI and security stories from general outlets into those sections, using both English and German keywords. It also drops coupon spam and groups headlines about the same event using word-overlap similarity.
- [`app/[lang]/page.tsx`](app/[lang]/page.tsx) renders each edition on the server. Both are regenerated every 15 minutes (`revalidate = 900`, Incremental Static Regeneration). It doesn't need a database, API keys or a cron job.
- [`proxy.ts`](proxy.ts) sends `/` to `/en` or `/de`.
- [`lib/i18n.ts`](lib/i18n.ts) holds all interface text in English and German.
- An open page refreshes itself when a newer edition is ready, and all timestamps update live.
- If a feed is down, the rest of the page still renders and that source is marked "unavailable" in the footer.

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. The first load of each edition takes a few seconds while the feeds are fetched.

## Deploy to Vercel

1. Push this repo to GitHub.
2. In Vercel, choose **Add New → Project** and import `Hakimi404/Tech_Blogs`.
3. Keep the defaults (Framework: Next.js) and click **Deploy**.

You don't need any environment variables.

## Customize

Edit [`lib/site.ts`](lib/site.ts) to change the site name, your name, the refresh interval or the launch date. The launch date is what the issue numbers count from. To change any interface text, edit [`lib/i18n.ts`](lib/i18n.ts).
