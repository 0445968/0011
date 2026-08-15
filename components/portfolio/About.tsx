'use client';

import { motion } from 'framer-motion';
import { Reveal } from './Reveal';

const philosophy = [
  {
    title: 'Design Philosophy',
    image: '/images/about/design-philosophy-2.jpg',
    body: 'I believe great design is invisible — it removes friction until only the experience remains. Every decision earns its place through intent, not decoration.',
  },
  {
    title: 'Development Approach',
    image: '/images/about/development-approach-2.webp',
    body: 'Type-safe, component-driven, and obsessed with the details between breakpoints. I build interfaces that are as maintainable as they are beautiful.',
  },
];

const expertise = [
  { label: 'Design', value: '10+ years' },
  { label: 'Frontend', value: '8+ years' },
  { label: 'Projects shipped', value: '120+' },
  { label: 'Templates', value: '8 & growing' },
];

export function About() {
  return (
    <section id="about" className="section-spacing relative">
      <div className="container-page">
        <Reveal className="flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          <span className="h-px w-8 bg-secondary" />
          About
        </Reveal>

        <div className="mt-10 grid gap-16 md:grid-cols-12 md:gap-12">
          <Reveal delay={0.1} className="md:col-span-7">
            <h2 className="text-balance font-serif text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
              An independent studio for teams who care about the details others
              overlook.
            </h2>
          </Reveal>

          <Reveal delay={0.2} className="md:col-span-5 md:pt-2">
            <p className="text-lg leading-relaxed text-muted-foreground">
              I&apos;m a designer and frontend engineer working at the
              intersection of editorial design and modern web technology. For
              over a decade I&apos;ve helped startups, agencies, and founders
              turn ambitious ideas into shipped, polished products.
            </p>
          </Reveal>
        </div>

        <div className="mt-20 grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-2">
          {philosophy.map((item, i) => (
            <Reveal key={item.title} delay={0.1 + i * 0.15}>
              <motion.div
                initial="rest"
                whileHover="hover"
                className="group relative h-[500px] overflow-hidden bg-card"
              >
                {/* Background Image */}
                <motion.img
                  src={item.image}
                  alt={item.title}
                  className="absolute inset-0 h-full w-full object-cover"
                  variants={{
                    rest: { scale: 1 },
                    hover: { scale: 1 },
                  }}
                  transition={{ duration: 0.7 }}
                />

                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-black/20" />

                {/* Bottom Content Card */}
                <div className="absolute bottom-0 left-0 right-0 z-20 bg-[#adeaff] p-8">
                  {/* Title (Always visible) */}
                  <h3 className="font-serif text-3xl font-semibold text-black">
                    {item.title}
                  </h3>

                  {/* Description Drawer (Slides down/up using Grid rows) */}
                  <motion.div
                    className="grid"
                    variants={{
                      rest: { gridTemplateRows: '0fr', opacity: 0, marginTop: 0 },
                      hover: { gridTemplateRows: '1fr', opacity: 1, marginTop: 16 },
                    }}
                    transition={{
                      duration: 0.4,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <div className="overflow-hidden">
                      <p className="text-lg leading-relaxed text-black/90">
                        {item.body}
                      </p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>

        <div className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-4">
          {expertise.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{
                duration: 0.6,
                delay: i * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="bg-card p-6 md:p-8"
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {stat.label}
              </p>

              <p className="mt-3 font-serif text-3xl font-semibold tracking-tight md:text-4xl">
                {stat.value}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}