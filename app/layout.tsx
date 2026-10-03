import type { Metadata } from "next";
import { IBM_Plex_Mono, Newsreader, Playfair_Display } from "next/font/google";
import { site } from "@/lib/site";
import "./globals.css";

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

export const metadata: Metadata = {
  title: `${site.name} — The last 24 hours in AI & tech`,
  description: `${site.tagline}. A daily front page compiled from 40+ newsrooms, labs and blogs by ${site.author}.`,
  authors: [{ name: site.author, url: site.github }],
  openGraph: {
    title: `${site.name} — The last 24 hours in AI & tech`,
    description: site.tagline,
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
