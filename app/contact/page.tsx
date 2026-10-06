import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { contactInfo } from '@/data/site';

export const metadata: Metadata = { title: 'Contact', description: 'Talk to Bivi about your next brand, design, or website project.' };

export default function ContactPage() {
  return <section className="container-page pb-28 pt-32 sm:pt-40">
    <div className="max-w-3xl">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">Get in touch</p>
      <h1 className="mt-5 font-heading text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">Good things start with a conversation.</h1>
      <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">Have a project in mind, a question about working together, or an idea you’d like to explore? Tell us about it.</p>
    </div>
    <div className="mt-12 grid gap-6 md:grid-cols-2">
      <div className="rounded-[28px] border border-border bg-card p-7 sm:p-9">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">New project</p>
        <h2 className="mt-4 font-heading text-2xl font-semibold">Tell us what you’re planning.</h2>
        <p className="mt-4 leading-relaxed text-muted-foreground">Choose services and share your goals. We’ll review your request and discuss the right scope and next steps.</p>
        <Button asChild className="mt-8 min-h-[48px] w-full rounded-[18px] px-1 font-mono sm:w-auto sm:px-6"><Link href="/get-started">Start a project <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
      </div>
      <div className="rounded-[28px] bg-muted/50 p-7 sm:p-9">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Questions and conversations</p>
        <h2 className="mt-4 font-heading text-2xl font-semibold">Send us a note.</h2>
        <p className="mt-4 leading-relaxed text-muted-foreground">For general questions or an existing project, reach us directly by email.</p>
        <a href={`mailto:${contactInfo.email}`} className="mt-8 inline-flex min-h-[48px] items-center gap-3 break-all text-lg font-medium underline decoration-border underline-offset-8"><Mail className="h-5 w-5 shrink-0" aria-hidden="true" />{contactInfo.email}</a>
        <p className="mt-6 text-sm text-muted-foreground">{contactInfo.location}</p>
      </div>
    </div>
  </section>;
}
