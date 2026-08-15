import type { BlogPost } from '@/data/blog';

interface ScoredPost {
  post: BlogPost;
  score: number;
}

export function getRelatedArticles({
  currentPost,
  posts,
  limit = 20,
}: {
  currentPost: BlogPost;
  posts: BlogPost[];
  limit?: number;
}) {
  if (!posts?.length) {
    return [];
  }

  /* Exclude current article by slug */
  const availablePosts = posts.filter(
    (post) =>
      post.slug !== currentPost.slug
  );

  if (!availablePosts.length) {
    return [];
  }

  const scoredPosts: ScoredPost[] =
    availablePosts.map((post) => ({
      post,
      score: calculateRelatedScore(
        currentPost,
        post
      ),
    }));

  scoredPosts.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    return (
      new Date(b.post.date).getTime() -
      new Date(a.post.date).getTime()
    );
  });

  const sameCategory =
    scoredPosts.filter(
      ({ post }) =>
        post.category ===
        currentPost.category
    );

  const otherCategories =
    scoredPosts.filter(
      ({ post }) =>
        post.category !==
        currentPost.category
    );

  const recommendations: BlogPost[] = [];

  const usedSlugs =
    new Set<string>();

  function add(post?: BlogPost) {
    if (!post) {
      return;
    }

    if (usedSlugs.has(post.slug)) {
      return;
    }

    recommendations.push(post);
    usedSlugs.add(post.slug);
  }

  /* First recommendation */
  add(sameCategory[0]?.post);

  /* Best different category */
  const firstOther =
    otherCategories[0]?.post;

  add(firstOther);

  /* Another different category */
  const secondOther =
    otherCategories.find(
      ({ post }) =>
        post.category !==
        firstOther?.category
    )?.post;

  add(secondOther);

  /* Second same-category result */
  add(sameCategory[1]?.post);

  /* Fill any missing initial positions */
  for (const { post } of scoredPosts) {
    if (recommendations.length >= 4) {
      break;
    }

    add(post);
  }

  /* Remaining queue */
  for (const { post } of scoredPosts) {
    if (
      recommendations.length >= limit
    ) {
      break;
    }

    add(post);
  }

  return recommendations.slice(0, limit);
}

function calculateRelatedScore(
  currentPost: BlogPost,
  candidate: BlogPost
) {
  let score = 0;

  const currentTags =
    currentPost.tags ?? [];

  const candidateTags =
    candidate.tags ?? [];

  const sharedTags =
    getSharedTags(
      currentTags,
      candidateTags
    );

  score += sharedTags.length * 4;

  if (
    candidate.category ===
    currentPost.category
  ) {
    score += 3;
  } else {
    score += 1;
  }

  const currentDate =
    new Date(
      currentPost.date
    ).getTime();

  const candidateDate =
    new Date(
      candidate.date
    ).getTime();

  if (
    !Number.isNaN(currentDate) &&
    !Number.isNaN(candidateDate)
  ) {
    const difference =
      Math.abs(
        currentDate -
          candidateDate
      );

    const days =
      difference /
      (1000 * 60 * 60 * 24);

    if (days <= 30) {
      score += 1;
    }
  }

  return score;
}

function getSharedTags(
  currentTags: string[],
  candidateTags: string[]
) {
  const candidateSet =
    new Set(
      candidateTags.map(
        normalizeTag
      )
    );

  return currentTags.filter(
    (tag) =>
      candidateSet.has(
        normalizeTag(tag)
      )
  );
}

function normalizeTag(
  tag: string
) {
  return tag
    .trim()
    .toLowerCase();
}