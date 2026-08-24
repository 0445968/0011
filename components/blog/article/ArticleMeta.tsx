import type { BlogPost } from '@/data/blog';

interface ArticleMetaProps {
  post: BlogPost;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function ArticleMeta({
  post,
}: ArticleMetaProps) {
  return (
    <div>
      <p
        className="
          text-[10px]
          font-semibold
          uppercase
          tracking-[0.2em]
          text-muted-foreground
        "
      >
        Article
      </p>

      <div
        className="
          mt-5
          h-px
          w-10
          bg-foreground
        "
      />

      <p
        className="
          mt-5
          max-w-[190px]
          text-xs
          leading-5
          text-muted-foreground
        "
      >
        Thoughts, observations and practical ideas
        from Bivi.
      </p>

      <div
        className="
          mt-9
          grid
          grid-cols-2
          gap-x-8
          gap-y-7
          lg:grid-cols-1
        "
      >
        <MetaItem
          label="Published"
          value={formatDate(post.date)}
        />

        <MetaItem
          label="Reading"
          value={post.readingTime}
        />

        <MetaItem
          label="Category"
          value={post.category}
        />

        <MetaItem
          label="Written by"
          value={post.author}
        />
      </div>
    </div>
  );
}

function MetaItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p
        className="
          text-[9px]
          font-semibold
          uppercase
          tracking-[0.18em]
          text-muted-foreground
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1.5
          max-w-[180px]
          text-xs
          leading-5
          text-foreground
        "
      >
        {value}
      </p>
    </div>
  );
}