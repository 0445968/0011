import { ArticleAdSlot } from './ArticleAdSlot';

export function ArticleAdRail() {
  return (
    <div className="space-y-10">
      <ArticleAdSlot
        size="medium"
        placement="journal-article-sidebar-primary"
      />

      <div className="hidden lg:block">
        <ArticleAdSlot
          size="tall"
          placement="journal-article-sidebar-secondary"
        />
      </div>
    </div>
  );
}