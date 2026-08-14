'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import {
  blogCategories,
  blogPosts,
} from '@/data/blog';

import { JournalHeader } from './journal/JournalHeader';
import { JournalCategoryNav } from './journal/JournalCategoryNav';
import { JournalHero } from './journal/JournalHero';
import { JournalArticleGrid } from './journal/JournalArticleGrid';
import { JournalCategorySection } from './journal/JournalCategorySection';
import { JournalSplitSection } from './journal/JournalSplitSection';
import { JournalTopics } from './journal/JournalTopics';
import { JournalNewsletter } from './journal/JournalNewsletter';

export function BlogList() {
  const [activeCategory, setActiveCategory] =
    useState('All');

  const filteredPosts = useMemo(() => {
    if (activeCategory === 'All') {
      return blogPosts;
    }

    return blogPosts.filter(
      (post) =>
        post.category === activeCategory
    );
  }, [activeCategory]);

  /*
   * Homepage content allocation
   *
   * 0       → Large lead story
   * 1–5     → Featured Posts sidebar
   * 6–9     → Four visual previews
   */
  const leadPost = filteredPosts[0];

  const featuredPosts =
    filteredPosts.slice(1, 6);

  const gridPosts =
    filteredPosts.slice(6, 10);

  /*
   * Remove "All" so only actual
   * categories are used below.
   */
  const categories =
    blogCategories.filter(
      (category) => category !== 'All'
    );

  const firstCategory =
    categories[0];

  const secondCategory =
    categories[1];

  const firstCategoryPosts =
    firstCategory
      ? blogPosts.filter(
          (post) =>
            post.category ===
            firstCategory
        )
      : [];

  const secondCategoryPosts =
    secondCategory
      ? blogPosts.filter(
          (post) =>
            post.category ===
            secondCategory
        )
      : [];

  function selectCategory(
    category: string
  ) {
    setActiveCategory(category);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  return (
    <main
      className="
        min-h-screen
        pt-28
        md:pt-32
      "
    >
      <div className="container-page">
        {/* Header */}
        <JournalHeader />

        {/* Categories */}
        <JournalCategoryNav
          categories={blogCategories}
          activeCategory={
            activeCategory
          }
          onCategoryChange={
            setActiveCategory
          }
        />

        {/* Journal content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -8,
            }}
            transition={{
              duration: 0.4,
              ease: [
                0.16,
                1,
                0.3,
                1,
              ],
            }}
          >
            {leadPost ? (
              <>
                {/* Hero */}
                <JournalHero
                  leadPost={
                    leadPost
                  }
                  featuredPosts={
                    featuredPosts
                  }
                />

                {/* Four article previews */}
                {gridPosts.length >
                  0 && (
                  <JournalArticleGrid
                    posts={
                      gridPosts
                    }
                  />
                )}

                {/* Full homepage */}
                {activeCategory ===
                  'All' && (
                  <>
                    {firstCategory && (
                      <JournalCategorySection
                        category={
                          firstCategory
                        }
                        posts={
                          firstCategoryPosts
                        }
                        onViewMore={() =>
                          selectCategory(
                            firstCategory
                          )
                        }
                      />
                    )}

                    {secondCategory && (
                      <JournalSplitSection
                        category={
                          secondCategory
                        }
                        posts={
                          secondCategoryPosts
                        }
                        onViewMore={() =>
                          selectCategory(
                            secondCategory
                          )
                        }
                      />
                    )}

                    <JournalTopics
                      categories={
                        blogCategories
                      }
                      posts={
                        blogPosts
                      }
                      onSelect={
                        selectCategory
                      }
                    />

                    <JournalNewsletter />
                  </>
                )}

                {/* Category view */}
                {activeCategory !==
                  'All' && (
                  <JournalCategorySection
                    category={
                      activeCategory
                    }
                    posts={
                      filteredPosts
                    }
                    onViewMore={() =>
                      setActiveCategory(
                        'All'
                      )
                    }
                    showAll
                  />
                )}
              </>
            ) : (
              <div
                className="
                  py-28
                  text-center
                "
              >
                <p
                  className="
                    font-serif
                    text-2xl
                    text-muted-foreground
                  "
                >
                  No articles in this
                  category yet.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}