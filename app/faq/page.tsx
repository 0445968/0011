'use client';

import { motion } from 'framer-motion';
import { HelpCircle, MessageSquare, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Reveal } from '@/components/portfolio/Reveal';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { faqCategories } from '@/data/faq';
import { useI18n } from '@/lib/i18n/context';

export default function FAQPage() {
  const { t } = useI18n();

  return (
    <>
      <PageHeader
        eyebrow={t('faq.eyebrow')}
        title={t('faq.title')}
        description={t('faq.description')}
      />

      {/* FAQ Categories */}
      <section className="section-spacing">
        <div className="container-page">
          {faqCategories.map((category, catIndex) => (
            <Reveal
              key={category.id}
              delay={catIndex * 0.05}
              className={catIndex > 0 ? 'mt-16' : ''}
            >
              <div className="mb-8 flex items-center gap-3">
                <span className="h-px w-8 bg-primary" />
                <h2 className="font-heading text-xl font-semibold tracking-tight">
                  {category.label}
                </h2>
              </div>

              <Accordion
                type="single"
                collapsible
                className="border-t border-border"
              >
                {category.items.map((item, itemIndex) => (
                  <AccordionItem
                    key={`${category.id}-${itemIndex}`}
                    value={`${category.id}-${itemIndex}`}
                    className="border-b border-border"
                  >
                    <AccordionTrigger className="py-5 text-left font-heading text-lg font-medium hover:no-underline">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-base text-muted-foreground">
                      <p className="max-w-3xl leading-relaxed">
                        {item.answer}
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border py-24">
        <div className="container-page">
          <Reveal>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="relative overflow-hidden rounded-3xl bg-primary px-8 py-16 text-center text-primary-foreground md:px-16 md:py-20"
            >
              <div className="relative z-10 mx-auto max-w-2xl">
                <div className="mb-6 flex justify-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/20">
                    <MessageSquare size={28} />
                  </div>
                </div>
                <h2 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
                  {t('faq.ctaTitle')}
                </h2>
                <p className="mt-4 text-lg text-primary-foreground/80">
                  {t('faq.ctaDescription')}
                </p>
                <a
                  href="/contact"
                  className="group mt-8 inline-flex items-center gap-2 rounded-full bg-secondary px-7 py-3.5 text-base font-medium text-primary transition-transform duration-300 hover:scale-[1.03] active:scale-95"
                >
                  {t('faq.ctaButton')}
                  <ArrowRight
                    size={18}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </a>
              </div>
            </motion.div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
