import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { blogPosts, getPostBySlug } from '@/data/blog';
import { ArticleContent } from '@/components/blog/ArticleContent';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = getPostBySlug(params.slug);
  if (!post) return { title: 'Article not found' };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      type: 'article',
      title: `${post.title} — Atelier Journal`,
      description: post.excerpt,
      publishedTime: post.date,
      authors: [post.author],
      images: [{ url: post.cover, alt: post.title }],
    },
  };
}

export default function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  const related = blogPosts
    .filter((p) => p.id !== post.id && p.category === post.category)
    .slice(0, 2);

  return (
    <article className="min-h-screen pt-28 md:pt-32">
      <div className="container-page">
        <a
          href="/blog"
          className="group inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft
            size={16}
            className="transition-transform duration-300 group-hover:-translate-x-1"
          />
          Back to journal
        </a>

        <div className="mx-auto mt-10 max-w-3xl">
          <div className="flex items-center gap-3 text-xs">
            <span className="font-semibold uppercase tracking-widest text-accent">
              {post.category}
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">{post.readingTime}</span>
          </div>
          <h1 className="mt-5 text-balance font-serif text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
            {post.title}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            {post.excerpt}
          </p>
          <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary font-serif text-sm font-semibold">
              A
            </span>
            <span>{post.author}</span>
            <span className="text-muted-foreground/50">·</span>
            <span>
              {new Date(post.date).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-3xl border border-border bg-card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.cover}
            alt={post.title}
            className="aspect-[16/9] w-full object-cover"
          />
        </div>

        <div className="mx-auto mt-16 max-w-3xl pb-8">
          <ArticleContent blocks={post.content} />

          <div className="mt-12 flex flex-wrap gap-2 border-t border-border pt-8">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border bg-secondary/40 px-3 py-1 text-xs font-medium text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {related.length > 0 && (
          <div className="mx-auto mt-8 max-w-4xl pb-24">
            <h2 className="font-serif text-2xl font-semibold tracking-tight">
              More in {post.category}
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {related.map((rp) => (
                <a
                  key={rp.id}
                  href={`/blog/${rp.slug}`}
                  className="group flex flex-col rounded-2xl border border-border bg-card p-6 transition-colors hover:border-foreground/30"
                >
                  <span className="text-xs font-semibold uppercase tracking-widest text-accent">
                    {rp.category}
                  </span>
                  <h3 className="mt-3 font-serif text-xl font-semibold tracking-tight">
                    {rp.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {rp.excerpt}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors group-hover:text-accent">
                    Read
                    <ArrowUpRight size={14} />
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
