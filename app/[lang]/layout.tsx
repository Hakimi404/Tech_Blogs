import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IBM_Plex_Mono, Newsreader, Playfair_Display } from "next/font/google";
import { dictionaries, isLang, langs } from "@/lib/i18n";
import { site } from "@/lib/site";
import { publishersFor } from "@/lib/sources";
import "../globals.css";

const display = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  style: ["normal", "italic"],
});

const body = Newsreader({
  variable: "--font-body",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// Only /en and /de exist; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return langs.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const t = dictionaries[lang];
  return {
    title: t.metaTitle,
    description: t.metaDescription(publishersFor(lang).length, site.author),
    authors: [{ name: site.author, url: site.github }],
    alternates: { languages: { en: "/en", de: "/de" } },
    openGraph: { title: t.metaTitle, description: t.tagline, type: "website", locale: lang === "de" ? "de_DE" : "en_US" },
  };
}

// Applies a saved light/dark choice before the first paint. Without one, the CSS follows the system setting.
const themeScript = `(function(){try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return (
    <html lang={lang} className={`${display.variable} ${body.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
