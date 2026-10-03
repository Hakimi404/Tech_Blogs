# Tech Blogs

**The last 24 hours in AI & technology, on one front page.** Compiled by Abdullah Ahmed.

Tech Blogs pulls the latest stories from 40 newsrooms, AI labs and engineering blogs, keeps only what was published in the past 24 hours, and lays it out like a daily newspaper. When several outlets report the same event, their headlines are grouped together and the story rises toward the top.

## Design

The site uses the **Editorial** style from [Tilda's web design styles guide](https://tilda.education/en/web-design-styles), the style meant for magazines, blogs and news outlets. It borrows from print newspapers:

- a masthead with volume, issue number and dateline, set in high-contrast Playfair Display
- Newsreader for body text and IBM Plex Mono for labels and timestamps
- column grids separated by printed rules, drop caps and numbered sections
- a "newsprint" paper texture, with a "night edition" in dark mode

## What's on the page

| Part | What it shows |
| --- | --- |
| **Top story + front page** | The 5 most important stories, ranked by how many outlets covered them, Hacker News points, recency and topic |
| **The Wire** | The latest headlines in the order they were published |
| **Today in numbers** | Story counts for each section |
| **Sections** | AI · Industry · Gadgets & Hardware · Security · Developers |

## Sources

OpenAI, Google AI, Google DeepMind, Hugging Face, NVIDIA, AWS Machine Learning, MIT Technology Review, The Decoder, Simon Willison, TechCrunch, The Verge, Ars Technica, Wired, The Guardian, BBC Technology, The Register, ZDNET, The Next Web, Fast Company, Crunchbase News, Gizmodo, Engadget, CNET, Tom's Hardware, 9to5Mac, 9to5Google, Mashable, Electrek, IEEE Spectrum, The Hacker News, BleepingComputer, Krebs on Security, Dark Reading, Hacker News, GitHub Blog, InfoQ and the Stack Overflow Blog.

To add or remove a source, edit [`lib/sources.ts`](lib/sources.ts). Any RSS or Atom feed works.

## How it works

- [`lib/feeds.ts`](lib/feeds.ts) fetches every feed in parallel, keeps the last 24 hours, and merges copies of the same URL that appear in several feeds. It moves AI and security stories from general outlets into those sections, drops coupon spam, and groups headlines about the same event using word-overlap similarity.
- [`app/page.tsx`](app/page.tsx) is rendered on the server and regenerated every 15 minutes (`revalidate = 900`, Incremental Static Regeneration). It doesn't need a database, API keys or a cron job.
- An open page refreshes itself when a newer edition is ready, and all timestamps update live.
- If a feed is down, the rest of the page still renders and that source is marked "unavailable" in the footer.

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. The first load takes a few seconds while the feeds are fetched.

## Deploy to Vercel

1. Push this repo to GitHub.
2. In Vercel, choose **Add New → Project** and import `Hakimi404/Tech_Blogs`.
3. Keep the defaults (Framework: Next.js) and click **Deploy**.

You don't need any environment variables.

## Customize

Edit [`lib/site.ts`](lib/site.ts) to change the site name, your name, the refresh interval or the launch date. The launch date is what the issue numbers count from.
