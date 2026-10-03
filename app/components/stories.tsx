import type { Cluster, Story } from "@/lib/feeds";
import { StoryImage, TimeAgo } from "./client";

type WithNow = { serverNow: string };

function Meta({ story, cluster, serverNow }: { story: Story; cluster?: Cluster } & WithNow) {
  const outlets = cluster?.publishers.length ?? 1;
  const hn = story.hn ?? cluster?.related.find((s) => s.hn)?.hn;
  return (
    <p className="meta">
      <span className="meta-source">{story.source}</span>
      <span className="meta-dot" aria-hidden>·</span>
      <TimeAgo iso={story.published} serverNow={serverNow} />
      {outlets > 1 && <span className="badge">{outlets} outlets</span>}
      {hn && (
        <a className="hn" href={hn.discussion} target="_blank" rel="noopener noreferrer">
          ▲ {hn.points} pts · {hn.comments} comments
        </a>
      )}
    </p>
  );
}

function Headline({ story, as: Tag = "h3", className }: { story: Story; as?: "h2" | "h3" | "h4"; className?: string }) {
  return (
    <Tag className={className}>
      <a href={story.link} target="_blank" rel="noopener noreferrer">
        {story.title}
      </a>
    </Tag>
  );
}

function AlsoIn({ cluster }: { cluster: Cluster }) {
  if (!cluster.related.length) return null;
  return (
    <p className="also-in">
      <span>Also in </span>
      {cluster.related.map((s, i) => (
        <span key={s.id}>
          {i > 0 && ", "}
          <a href={s.link} target="_blank" rel="noopener noreferrer" title={s.title}>
            {s.source}
          </a>
        </span>
      ))}
    </p>
  );
}

export function LeadStory({ cluster, serverNow }: { cluster: Cluster } & WithNow) {
  const { lead } = cluster;
  return (
    <article className="lead">
      <p className="kicker">
        Top story{cluster.publishers.length > 1 && ` — reported by ${cluster.publishers.length} outlets`}
      </p>
      <Headline story={lead} as="h2" className="lead-headline" />
      {lead.image && <StoryImage src={lead.image} className="lead-image" />}
      {lead.excerpt && <p className="lead-dek dropcap">{lead.excerpt}</p>}
      <Meta story={lead} serverNow={serverNow} />
      {cluster.related.length > 0 && (
        <ul className="coverage">
          {cluster.related.slice(0, 4).map((s) => (
            <li key={s.id}>
              <span className="coverage-source">{s.source}</span>
              <a href={s.link} target="_blank" rel="noopener noreferrer">
                {s.title}
              </a>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

export function SecondaryStory({ cluster, serverNow, withImage }: { cluster: Cluster; withImage?: boolean } & WithNow) {
  const { lead } = cluster;
  return (
    <article className="secondary">
      {withImage && lead.image && <StoryImage src={lead.image} />}
      <Headline story={lead} className="secondary-headline" />
      {lead.excerpt && <p className="dek">{lead.excerpt}</p>}
      <Meta story={lead} cluster={cluster} serverNow={serverNow} />
      <AlsoIn cluster={cluster} />
    </article>
  );
}

export function FeaturedStory({ cluster, serverNow }: { cluster: Cluster } & WithNow) {
  const { lead } = cluster;
  return (
    <article className="featured">
      {lead.image && <StoryImage src={lead.image} />}
      <Headline story={lead} as="h3" className="featured-headline" />
      {lead.excerpt && <p className="dek dek-large">{lead.excerpt}</p>}
      <Meta story={lead} cluster={cluster} serverNow={serverNow} />
      <AlsoIn cluster={cluster} />
    </article>
  );
}

export function ColumnStory({ cluster, serverNow }: { cluster: Cluster } & WithNow) {
  const { lead } = cluster;
  return (
    <article className="column-story">
      <Headline story={lead} as="h4" className="column-headline" />
      {lead.excerpt && <p className="dek dek-clamp">{lead.excerpt}</p>}
      <Meta story={lead} cluster={cluster} serverNow={serverNow} />
      <AlsoIn cluster={cluster} />
    </article>
  );
}

export function CompactStory({ cluster, serverNow }: { cluster: Cluster } & WithNow) {
  return (
    <li className="compact">
      <Headline story={cluster.lead} as="h4" className="compact-headline" />
      <Meta story={cluster.lead} cluster={cluster} serverNow={serverNow} />
    </li>
  );
}

export function Wire({ stories, serverNow }: { stories: Story[] } & WithNow) {
  return (
    <aside className="wire" aria-labelledby="wire-title">
      <h2 id="wire-title" className="wire-title">
        <span className="live-dot" aria-hidden /> The Wire
      </h2>
      <p className="wire-sub">Latest headlines, as they land</p>
      <ol className="wire-list">
        {stories.map((s) => (
          <li key={s.id}>
            <p className="wire-meta">
              <TimeAgo iso={s.published} serverNow={serverNow} /> — {s.source}
            </p>
            <a href={s.link} target="_blank" rel="noopener noreferrer">
              {s.title}
            </a>
          </li>
        ))}
      </ol>
    </aside>
  );
}
