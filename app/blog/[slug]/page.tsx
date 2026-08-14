import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import {
  blogPosts,
  getPostBySlug,
} from '@/data/blog';

import { ArticleContent } from '@/components/blog/ArticleContent';

import { ArticleHero } from '@/components/blog/article/ArticleHero';
import { ArticleBodyLayout } from '@/components/blog/article/ArticleBodyLayout';

import { RelatedArticlesCarousel } from '@/components/blog/article/related/RelatedArticlesCarousel';

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const post = getPostBySlug(
    params.slug
  );

  if (!post) {
    return {
      title: 'Article not found',
    };
  }

  return {
    title: `${post.title} — Design Blade Journal`,
    description: post.excerpt,

    openGraph: {
      type: 'article',
      title: `${post.title} — Design Blade Journal`,
      description: post.excerpt,
      publishedTime: post.date,
      authors: [post.author],

      images: [
        {
          url: post.cover,
          alt: post.title,
        },
      ],
    },
  };
}

export default function BlogPostPage({
  params,
}: BlogPostPageProps) {
  const post = getPostBySlug(
    params.slug
  );

  if (!post) {
    notFound();
  }

  return (
    <main
      className="
        min-h-screen
        pb-24
        pt-16
        md:pb-32
        md:pt-20
      "
    >
      {/* Full-width hero */}
      <ArticleHero
        post={post}
      />

      {/* Article */}
      <div className="container-page">
        <ArticleBodyLayout
          post={post}
        >
          <ArticleContent
            content={post.content}
          />
        </ArticleBodyLayout>
      </div>

      {/* Related articles */}
      <div className="container-page">
        <RelatedArticlesCarousel
          currentPost={post}
          posts={blogPosts}
        />
      </div>
    </main>
  );
}