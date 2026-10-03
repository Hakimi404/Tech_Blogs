import type { Cluster, Story } from "@/lib/feeds";
import type { Dictionary, Lang } from "@/lib/i18n";
import { StoryImage, TimeAgo } from "./client";

/** What every story component needs to render its labels and timestamps. */
export type Ctx = { serverNow: string; lang: Lang; t: Dictionary };

function Meta({ story, cluster, ctx }: { story: Story; cluster?: Cluster; ctx: Ctx }) {
  const outlets = cluster?.publishers.length ?? 1;
  const hn = story.hn ?? cluster?.related.find((s) => s.hn)?.hn;
  return (
    <p className="meta">
      <span className="meta-source">{story.source}</span>
      <span className="meta-dot" aria-hidden>·</span>
      <TimeAgo iso={story.published} serverNow={ctx.serverNow} lang={ctx.lang} />
      {outlets > 1 && <span className="badge">{ctx.t.outlets(outlets)}</span>}
      {hn && (
        <a className="hn" href={hn.discussion} target="_blank" rel="noopener noreferrer">
          {ctx.t.hn(hn.points, hn.comments)}
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

function AlsoIn({ cluster, ctx }: { cluster: Cluster; ctx: Ctx }) {
  if (!cluster.related.length) return null;
  return (
    <p className="also-in">
      <span>{ctx.t.alsoIn} </span>
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

export function LeadStory({ cluster, ctx }: { cluster: Cluster; ctx: Ctx }) {
  const { lead } = cluster;
  return (
    <article className="lead">
      <p className="kicker">
        {ctx.t.topStory}
        {cluster.publishers.length > 1 && ` — ${ctx.t.reportedBy(cluster.publishers.length)}`}
      </p>
      <Headline story={lead} as="h2" className="lead-headline" />
      {lead.image && <StoryImage src={lead.image} className="lead-image" />}
      {lead.excerpt && <p className="lead-dek dropcap">{lead.excerpt}</p>}
      <Meta story={lead} ctx={ctx} />
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

export function SecondaryStory({ cluster, ctx, withImage }: { cluster: Cluster; ctx: Ctx; withImage?: boolean }) {
  const { lead } = cluster;
  return (
    <article className="secondary">
      {withImage && lead.image && <StoryImage src={lead.image} />}
      <Headline story={lead} className="secondary-headline" />
      {lead.excerpt && <p className="dek">{lead.excerpt}</p>}
      <Meta story={lead} cluster={cluster} ctx={ctx} />
      <AlsoIn cluster={cluster} ctx={ctx} />
    </article>
  );
}

export function FeaturedStory({ cluster, ctx }: { cluster: Cluster; ctx: Ctx }) {
  const { lead } = cluster;
  return (
    <article className="featured">
      {lead.image && <StoryImage src={lead.image} />}
      <Headline story={lead} as="h3" className="featured-headline" />
      {lead.excerpt && <p className="dek dek-large">{lead.excerpt}</p>}
      <Meta story={lead} cluster={cluster} ctx={ctx} />
      <AlsoIn cluster={cluster} ctx={ctx} />
    </article>
  );
}

export function ColumnStory({ cluster, ctx }: { cluster: Cluster; ctx: Ctx }) {
  const { lead } = cluster;
  return (
    <article className="column-story">
      <Headline story={lead} as="h4" className="column-headline" />
      {lead.excerpt && <p className="dek dek-clamp">{lead.excerpt}</p>}
      <Meta story={lead} cluster={cluster} ctx={ctx} />
      <AlsoIn cluster={cluster} ctx={ctx} />
    </article>
  );
}

export function CompactStory({ cluster, ctx }: { cluster: Cluster; ctx: Ctx }) {
  return (
    <li className="compact">
      <Headline story={cluster.lead} as="h4" className="compact-headline" />
      <Meta story={cluster.lead} cluster={cluster} ctx={ctx} />
    </li>
  );
}

export function Wire({ stories, ctx }: { stories: Story[]; ctx: Ctx }) {
  return (
    <aside className="wire" aria-labelledby="wire-title">
      <h2 id="wire-title" className="wire-title">
        <span className="live-dot" aria-hidden /> {ctx.t.wireTitle}
      </h2>
      <p className="wire-sub">{ctx.t.wireSub}</p>
      <ol className="wire-list">
        {stories.map((s) => (
          <li key={s.id}>
            <p className="wire-meta">
              <TimeAgo iso={s.published} serverNow={ctx.serverNow} lang={ctx.lang} /> — {s.source}
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
