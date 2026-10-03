export type SectionId = "ai" | "industry" | "gadgets" | "security" | "developers";

export type Section = {
  id: SectionId;
  title: string;
  kicker: string;
};

export const sections: Section[] = [
  { id: "ai", title: "Artificial Intelligence", kicker: "Models, labs & research" },
  { id: "industry", title: "Industry", kicker: "Business, policy & big tech" },
  { id: "gadgets", title: "Gadgets & Hardware", kicker: "Devices, chips & EVs" },
  { id: "security", title: "Security", kicker: "Breaches, exploits & privacy" },
  { id: "developers", title: "Developers", kicker: "Code, tools & open source" },
];

export type Source = {
  name: string;
  url: string;
  section: SectionId;
  /** Specialist sources keep their section; general ones are re-filed by keyword (e.g. an AI story on The Verge goes to AI). */
  specialist?: boolean;
};

// Several publishers appear twice (a topic feed + the main feed). Stories found in both are merged by URL.
export const sources: Source[] = [
  // Artificial intelligence
  { name: "OpenAI", url: "https://openai.com/news/rss.xml", section: "ai", specialist: true },
  { name: "Google AI", url: "https://blog.google/technology/ai/rss/", section: "ai", specialist: true },
  { name: "Google DeepMind", url: "https://deepmind.google/blog/rss.xml", section: "ai", specialist: true },
  { name: "Hugging Face", url: "https://huggingface.co/blog/feed.xml", section: "ai", specialist: true },
  { name: "NVIDIA", url: "https://blogs.nvidia.com/feed/", section: "ai", specialist: true },
  { name: "AWS Machine Learning", url: "https://aws.amazon.com/blogs/machine-learning/feed/", section: "ai", specialist: true },
  { name: "MIT Technology Review", url: "https://www.technologyreview.com/topic/artificial-intelligence/feed", section: "ai", specialist: true },
  { name: "The Decoder", url: "https://the-decoder.com/feed/", section: "ai", specialist: true },
  { name: "Simon Willison", url: "https://simonwillison.net/atom/everything/", section: "ai", specialist: true },
  { name: "TechCrunch", url: "https://techcrunch.com/category/artificial-intelligence/feed/", section: "ai", specialist: true },
  { name: "The Verge", url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml", section: "ai", specialist: true },
  { name: "Ars Technica", url: "https://arstechnica.com/ai/feed/", section: "ai", specialist: true },

  // Industry
  { name: "TechCrunch", url: "https://techcrunch.com/feed/", section: "industry" },
  { name: "The Verge", url: "https://www.theverge.com/rss/index.xml", section: "industry" },
  { name: "Ars Technica", url: "https://feeds.arstechnica.com/arstechnica/index", section: "industry" },
  { name: "Wired", url: "https://www.wired.com/feed/rss", section: "industry" },
  { name: "The Guardian", url: "https://www.theguardian.com/uk/technology/rss", section: "industry" },
  { name: "BBC Technology", url: "https://feeds.bbci.co.uk/news/technology/rss.xml", section: "industry" },
  { name: "The Register", url: "https://www.theregister.com/headlines.atom", section: "industry" },
  { name: "ZDNET", url: "https://www.zdnet.com/news/rss.xml", section: "industry" },
  { name: "The Next Web", url: "https://thenextweb.com/feed", section: "industry" },
  { name: "Fast Company", url: "https://www.fastcompany.com/technology/rss", section: "industry" },
  { name: "Crunchbase News", url: "https://news.crunchbase.com/feed/", section: "industry" },
  { name: "Gizmodo", url: "https://gizmodo.com/feed", section: "industry" },

  // Gadgets & hardware
  { name: "Engadget", url: "https://www.engadget.com/rss.xml", section: "gadgets" },
  { name: "CNET", url: "https://www.cnet.com/rss/news/", section: "gadgets" },
  { name: "Tom's Hardware", url: "https://www.tomshardware.com/feeds/all", section: "gadgets" },
  { name: "9to5Mac", url: "https://9to5mac.com/feed/", section: "gadgets" },
  { name: "9to5Google", url: "https://9to5google.com/feed/", section: "gadgets" },
  { name: "Mashable", url: "https://mashable.com/feeds/rss/tech", section: "gadgets" },
  { name: "Electrek", url: "https://electrek.co/feed/", section: "gadgets" },
  { name: "IEEE Spectrum", url: "https://spectrum.ieee.org/feeds/feed.rss", section: "gadgets" },

  // Security
  { name: "The Hacker News", url: "https://feeds.feedburner.com/TheHackersNews", section: "security", specialist: true },
  { name: "BleepingComputer", url: "https://www.bleepingcomputer.com/feed/", section: "security", specialist: true },
  { name: "Krebs on Security", url: "https://krebsonsecurity.com/feed/", section: "security", specialist: true },
  { name: "Dark Reading", url: "https://www.darkreading.com/rss.xml", section: "security", specialist: true },

  // Developers
  { name: "Hacker News", url: "https://hnrss.org/frontpage?points=100", section: "developers" },
  { name: "GitHub Blog", url: "https://github.blog/feed/", section: "developers" },
  { name: "InfoQ", url: "https://feed.infoq.com/", section: "developers" },
  { name: "Stack Overflow Blog", url: "https://stackoverflow.blog/feed/", section: "developers" },
];

export const publisherCount = new Set(sources.map((s) => s.name)).size;
