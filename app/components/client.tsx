"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";

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

function relative(ms: number) {
  const minutes = Math.max(0, Math.round(ms / 60_000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return hours < 48 ? `${hours}h ago` : `${Math.floor(hours / 24)}d ago`;
}

export function TimeAgo({ iso, serverNow }: { iso: string; serverNow: string }) {
  const current = useNow(serverNow);
  return (
    <time dateTime={iso} title={new Date(iso).toUTCString()}>
      {relative(current - Date.parse(iso))}
    </time>
  );
}

const subscribeNever = () => () => {};

/** The edition date in the reader's own time zone (UTC on the server). */
export function EditionDate({ iso }: { iso: string }) {
  const isClient = useSyncExternalStore(subscribeNever, () => true, () => false);
  return (
    <time dateTime={iso}>
      {new Date(iso).toLocaleDateString("en-US", {
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
