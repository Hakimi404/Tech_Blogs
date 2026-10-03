"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { LANG_COOKIE, langs, type Lang } from "@/lib/i18n";

/** Flips between light and dark. The icon and label shown are picked by CSS from the current theme, so nothing flashes. */
export function ThemeToggle({ label, light, dark }: { label: string; light: string; dark: string }) {
  function toggle() {
    const root = document.documentElement;
    const current = root.dataset.theme ?? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = current === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
  }
  return (
    <button type="button" className="theme-toggle" onClick={toggle} aria-label={label} title={label}>
      <span className="theme-to-dark">
        <svg viewBox="0 0 24 24" aria-hidden>
          <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
        </svg>
        {dark}
      </span>
      <span className="theme-to-light">
        <svg viewBox="0 0 24 24" aria-hidden>
          <circle cx="12" cy="12" r="4.2" />
          <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" />
        </svg>
        {light}
      </span>
    </button>
  );
}

/** EN | DE links; the choice is remembered so visiting "/" opens the same edition next time. */
export function LanguageSwitch({ current, label }: { current: Lang; label: string }) {
  return (
    <nav className="lang-switch" aria-label={label}>
      {langs.map((lang) => (
        <a
          key={lang}
          href={`/${lang}`}
          hrefLang={lang}
          lang={lang}
          aria-current={lang === current ? "page" : undefined}
          onClick={() => {
            document.cookie = `${LANG_COOKIE}=${lang}; path=/; max-age=31536000; samesite=lax`;
          }}
        >
          {lang.toUpperCase()}
        </a>
      ))}
    </nav>
  );
}

// One shared clock for every timestamp on the page, ticking every 30s.
let now = Date.now();
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!timer) {
    now = Date.now();
    timer = setInterval(() => {
      now = Date.now();
      listeners.forEach((l) => l());
    }, 30_000);
  }
  return () => {
    listeners.delete(listener);
    if (!listeners.size) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}

/** Current time on the client; the edition's generation time during server render and hydration. */
function useNow(serverNow: string) {
  return useSyncExternalStore(subscribe, () => now, () => Date.parse(serverNow));
}

function relative(ms: number, lang: Lang) {
  const minutes = Math.max(0, Math.round(ms / 60_000));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (lang === "de") {
    if (minutes < 1) return "gerade eben";
    if (minutes < 60) return `vor ${minutes} Min.`;
    return hours < 48 ? `vor ${hours} Std.` : `vor ${days} Tagen`;
  }
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  return hours < 48 ? `${hours}h ago` : `${days}d ago`;
}

export function TimeAgo({ iso, serverNow, lang }: { iso: string; serverNow: string; lang: Lang }) {
  const current = useNow(serverNow);
  return (
    <time dateTime={iso} title={new Date(iso).toUTCString()}>
      {relative(current - Date.parse(iso), lang)}
    </time>
  );
}

const subscribeNever = () => () => {};

/** The edition date in the reader's own time zone (UTC on the server). */
export function EditionDate({ iso, locale }: { iso: string; locale: string }) {
  const isClient = useSyncExternalStore(subscribeNever, () => true, () => false);
  return (
    <time dateTime={iso}>
      {new Date(iso).toLocaleDateString(locale, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: isClient ? undefined : "UTC",
      })}
    </time>
  );
}

/**
 * Keeps the page current. The page is regenerated on the server every `refreshSeconds`, but a visitor
 * may be served the previous copy while the new one is built, so ask for the fresh copy shortly after.
 */
export function EditionRefresher({ generatedAt, refreshSeconds }: { generatedAt: string; refreshSeconds: number }) {
  const router = useRouter();
  useEffect(() => {
    const age = Date.now() - Date.parse(generatedAt);
    const isStale = age > (refreshSeconds + 60) * 1000;
    const retryKey = `refreshed:${generatedAt}`;
    let alreadyRetried = false;
    try {
      alreadyRetried = sessionStorage.getItem(retryKey) === "1";
      if (isStale) sessionStorage.setItem(retryKey, "1");
    } catch {}

    const delay = isStale && !alreadyRetried ? 8_000 : Math.max(60_000, refreshSeconds * 1000 - age + 30_000);
    const id = setTimeout(() => router.refresh(), delay);
    return () => clearTimeout(id);
  }, [generatedAt, refreshSeconds, router]);
  return null;
}

/** A publisher's image, which removes itself if the hotlink fails. */
export function StoryImage({ src, className }: { src: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <div className={`story-image ${className ?? ""}`}>
      {/* Remote images come from dozens of publisher CDNs, so they bypass next/image optimization. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setFailed(true)} />
    </div>
  );
}
