export type BlogBlock =
  | {
      type: 'paragraph';
      text: string;
    }
  | {
      type: 'heading';
      text: string;
    }
  | {
      type: 'quote';
      text: string;
    }
  | {
      type: 'list';
      items: string[];
    };

export interface BlogPost {
  id: string;
  slug: string;

  title: string;
  excerpt: string;

  category: string;

  author: string;
  date: string;
  readingTime: string;

  cover: string;

  tags: string[];

  content: BlogBlock[];
}