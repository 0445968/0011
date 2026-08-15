'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Check, Mail } from 'lucide-react';
import { contactInfo, socialLinks } from '@/data/site';
import { Reveal } from './Reveal';

type Status = 'idle' | 'submitting' | 'success';

export function Contact() {
  const [status, setStatus] = useState<Status>('idle');
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    // Frontend-only demo: simulate a send without a backend.
    setTimeout(() => setStatus('success'), 900);
  };

  const reset = () => {
    setStatus('idle');
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <section id="contact" className="section-spacing relative">
      <div className="container-page">
        <div className="overflow-hidden rounded-3xl border border-border bg-card">
          <div className="grid md:grid-cols-2">
            <div className="relative flex flex-col justify-between gap-12 border-b border-border bg-primary p-10 text-primary-foreground md:border-b-0 md:border-r md:p-14">
              <div>
                <Reveal className="flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-primary-foreground/60">
                  <span className="h-px w-8 bg-secondary" />
                  Contact
                </Reveal>
                <Reveal delay={0.1}>
                  <h2 className="mt-8 text-balance font-serif text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
                    Let&apos;s build something inevitable.
                  </h2>
                </Reveal>
                <Reveal delay={0.2}>
                  <p className="mt-6 max-w-md text-base leading-relaxed text-primary-foreground/70">
                    Have a project in mind, or curious about a template? Send a
                    note and you&apos;ll hear back within a day.
                  </p>
                </Reveal>
              </div>

              <div className="space-y-6">
                <Reveal delay={0.25}>
                  <a
                    href={`mailto:${contactInfo.email}`}
                    className="group inline-flex items-center gap-2 text-lg font-medium"
                  >
                    <Mail size={18} className="text-accent" />
                    {contactInfo.email}
                    <ArrowUpRight
                      size={16}
                      className="opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                    />
                  </a>
                </Reveal>

                <Reveal delay={0.3}>
                  <ul className="flex flex-wrap gap-3">
                    {socialLinks.map((link) => (
                      <li key={link.id}>
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={link.label}
                          className="flex h-10 w-10 items-center justify-center rounded-full border border-primary-foreground/20 text-primary-foreground/80 transition-all duration-300 hover:border-accent hover:bg-accent hover:text-accent-foreground"
                        >
                          <link.icon size={17} />
                        </a>
                      </li>
                    ))}
                  </ul>
                </Reveal>

                <Reveal delay={0.35}>
                  <div className="space-y-1 text-sm text-primary-foreground/60">
                    <p>{contactInfo.location}</p>
                    <p>{contactInfo.responseTime}</p>
                  </div>
                </Reveal>
              </div>
            </div>

            <div className="p-10 md:p-14">
              <AnimatePresence mode="wait">
                {status === 'success' ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex h-full flex-col items-center justify-center text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
                      className="flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-success"
                    >
                      <Check size={30} strokeWidth={2.5} />
                    </motion.div>
                    <h3 className="mt-6 font-serif text-2xl font-semibold tracking-tight">
                      Message sent
                    </h3>
                    <p className="mt-3 max-w-xs text-sm text-muted-foreground">
                      Thanks, {form.name || 'there'} — your note is on its way.
                      I&apos;ll be in touch shortly.
                    </p>
                    <button
                      onClick={reset}
                      className="mt-8 text-sm font-medium text-accent transition-opacity hover:opacity-80"
                    >
                      Send another message
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="flex h-full flex-col gap-5"
                  >
                    <div>
                      <label
                        htmlFor="name"
                        className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
                      >
                        Name
                      </label>
                      <input
                        id="name"
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Your name"
                        className="mt-2 w-full rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-foreground/40 focus:ring-2 focus:ring-ring/30"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
                      >
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="you@example.com"
                        className="mt-2 w-full rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-foreground/40 focus:ring-2 focus:ring-ring/30"
                      />
                    </div>
                    <div className="flex-1">
                      <label
                        htmlFor="message"
                        className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
                      >
                        Project details
                      </label>
                      <textarea
                        id="message"
                        required
                        rows={4}
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        placeholder="Tell me about your project, timeline, and goals…"
                        className="mt-2 w-full resize-none rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-foreground/40 focus:ring-2 focus:ring-ring/30"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={status === 'submitting'}
                      className="group inline-flex items-center justify-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-medium text-accent-foreground transition-transform duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-60"
                    >
                      {status === 'submitting' ? 'Sending…' : 'Send message'}
                      {status !== 'submitting' && (
                        <ArrowUpRight
                          size={16}
                          className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        />
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
