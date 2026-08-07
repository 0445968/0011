import { resources, type ResourceType } from './resources';
import { blogPosts } from './blog';
import { templates } from './templates';
import { projects } from './projects';
import { services } from './services';

export type SearchResultType =
  | 'resource'
  | 'blog'
  | 'template'
  | 'project'
  | 'service';

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  description: string;
  href: string;
  tags: string[];
  category: string;
  external?: boolean;
  badge?: string;
  image?: string;
}

export const searchTypeLabels: Record<SearchResultType, string> = {
  resource: 'Resources',
  blog: 'Articles',
  template: 'Templates',
  project: 'Projects',
  service: 'Services',
};

export const searchTypeOrder: SearchResultType[] = [
  'service',
  'project',
  'template',
  'blog',
  'resource',
];

const resourceTypeLabel: Record<ResourceType, string> = {
  guide: 'Guide',
  tool: 'Tool',
  article: 'Article',
  link: 'Link',
};

function buildSearchIndex(): SearchResult[] {
  const results: SearchResult[] = [];

  for (const r of resources) {
    results.push({
      id: `resource-${r.id}`,
      type: 'resource',
      title: r.title,
      description: r.description,
      href: r.href,
      tags: r.tags,
      category: r.category,
      external: r.external,
      badge: r.badge ?? resourceTypeLabel[r.type],
      image: r.preview,
    });
  }

  for (const p of blogPosts) {
    results.push({
      id: `blog-${p.id}`,
      type: 'blog',
      title: p.title,
      description: p.excerpt,
      href: `/blog/${p.slug}`,
      tags: p.tags,
      category: p.category,
      badge: p.readingTime,
      image: p.cover,
    });
  }

  for (const t of templates) {
    results.push({
      id: `template-${t.id}`,
      type: 'template',
      title: t.name,
      description: t.description,
      href: t.route,
      tags: [...t.tags, ...t.technologies],
      category: t.category,
      badge: t.category,
      image: t.preview,
    });
  }

  for (const p of projects) {
    results.push({
      id: `project-${p.id}`,
      type: 'project',
      title: p.name,
      description: p.description,
      href: `/work#${p.slug}`,
      tags: p.technologies,
      category: p.category,
      badge: p.year,
      image: p.image,
    });
  }

  for (const s of services) {
    results.push({
      id: `service-${s.id}`,
      type: 'service',
      title: s.title,
      description: s.description,
      href: `/services#${s.id}`,
      tags: s.capabilities,
      category: 'Services',
      badge: 'Service',
    });
  }

  return results;
}

export const searchIndex: SearchResult[] = buildSearchIndex();

export const allTags: string[] = Array.from(
  new Set(searchIndex.flatMap((r) => r.tags))
).sort((a, b) => a.localeCompare(b));

export const allCategories: string[] = Array.from(
  new Set(searchIndex.map((r) => r.category))
).sort((a, b) => a.localeCompare(b));
