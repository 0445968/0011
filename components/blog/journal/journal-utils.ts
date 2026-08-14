export function formatJournalDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: '2-digit',
  });
}

export function formatLongJournalDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getPostHref(slug: string) {
  return `/blog/${slug}`;
}

export function getCategoryPosts<
  T extends { category: string }
>(
  posts: T[],
  category: string
) {
  return posts.filter(
    (post) => post.category === category
  );
}

export function getJournalCategories(
  categories: string[]
) {
  return categories.filter(
    (category) => category !== 'All'
  );
}