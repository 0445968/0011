export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQCategory {
  id: string;
  label: string;
  items: FAQItem[];
}

export const faqCategories: FAQCategory[] = [
  {
    id: 'services',
    label: 'Services & Scope',
    items: [
      {
        question: 'What services does Design Blade offer?',
        answer:
          'We offer end-to-end web design and development — including UI/UX design, frontend development with Next.js and TypeScript, branding systems, SaaS application design, and creative direction. Each engagement is scoped to your specific needs, whether that\'s a single landing page or a full platform.',
      },
      {
        question: 'Do you work with startups or only established companies?',
        answer:
          'We work with both. For early-stage startups, we offer focused engagements that prioritize speed-to-market without sacrificing polish. For established companies, we take on larger redesigns, design systems, and platform-level work. The key criterion is shared commitment to quality.',
      },
      {
        question: 'Can you handle both design and development?',
        answer:
          'Yes. Design Blade is a full-stack creative studio — we design in Figma and build in code. This means zero handoff friction and pixel-perfect implementation. If you have an existing design team, we can also work development-only.',
      },
      {
        question: 'Do you offer ongoing maintenance after launch?',
        answer:
          'Yes. We offer monthly retainer arrangements for post-launch support, iterative improvements, and feature additions. Retainer clients get priority scheduling and fixed monthly hours.',
      },
    ],
  },
  {
    id: 'process',
    label: 'Process & Timeline',
    items: [
      {
        question: 'What is your typical project timeline?',
        answer:
          'A landing page or marketing site typically takes 3–5 weeks. A full SaaS dashboard or multi-page platform ranges from 8–16 weeks depending on scope. We provide a detailed timeline after the initial discovery call.',
      },
      {
        question: 'How do we get started?',
        answer:
          'It starts with a conversation. Reach out through the contact page, tell us about your project, and we\'ll schedule a discovery call. From there, we send a proposal with scope, timeline, and pricing within 48 hours.',
      },
      {
        question: 'What does the typical workflow look like?',
        answer:
          'Our process has four phases: Discovery (research, audit, strategy), Design (wireframes, high-fidelity mockups, prototypes), Development (component-driven build, type-safe code), and Delivery (QA, launch, post-launch support). You\'re involved at every step.',
      },
      {
        question: 'How involved will I be during the project?',
        answer:
          'As involved as you want to be. We schedule weekly check-ins and provide async updates via your preferred channel. You\'ll review and approve at each milestone — discovery findings, design directions, and staging builds before launch.',
      },
    ],
  },
  {
    id: 'pricing',
    label: 'Pricing & Payment',
    items: [
      {
        question: 'How do you price projects?',
        answer:
          'We use fixed-price project quotes, not hourly billing. Once we understand your scope, we provide a single all-inclusive price. No surprise invoices. For ongoing work, we offer monthly retainers with defined hour allocations.',
      },
      {
        question: 'What is your payment structure?',
        answer:
          'For project work: 50% deposit to begin, 50% upon delivery. For retainers: billed monthly in advance. We accept bank transfer, credit card, and Stripe. International clients can pay in their local currency.',
      },
      {
        question: 'Do you offer refunds?',
        answer:
          'The initial deposit covers discovery and design exploration, which is non-refundable once work begins. If we haven\'t started yet, the deposit is fully refundable. We pride ourselves on client satisfaction — if something isn\'t right, we\'ll fix it before asking for final payment.',
      },
    ],
  },
  {
    id: 'technical',
    label: 'Technical & Hosting',
    items: [
      {
        question: 'What technologies do you use?',
        answer:
          'Our core stack: Next.js, React, TypeScript, Tailwind CSS, and Supabase for backend services. We also work with Vite, Framer Motion for animation, and shadcn/ui for component primitives. We choose tools based on your project\'s needs, not trends.',
      },
      {
        question: 'Will I own the code and design files?',
        answer:
          'Absolutely. Upon final payment, you receive full ownership of all code (in your GitHub repository) and all design files (Figma). No lock-in, no proprietary dependencies. Everything is documented and transferable.',
      },
      {
        question: 'Can you work with my existing tech stack?',
        answer:
          'We\'re pragmatic. If your team uses Vue, Django, Rails, or any other stack, we can adapt. Our design work is stack-agnostic, and our development work prioritizes your team\'s existing conventions.',
      },
      {
        question: 'Do you handle hosting and deployment?',
        answer:
          'We set up and configure your deployment pipeline (typically Vercel or Netlify for Next.js). After launch, you can manage hosting yourself or keep us on a retainer for infrastructure support.',
      },
    ],
  },
  {
    id: 'collaboration',
    label: 'Collaboration & Communication',
    items: [
      {
        question: 'Do you work remotely or on-site?',
        answer:
          'We\'re a remote-first studio, which means we can work with clients anywhere. For larger engagements, we\'re available for on-site workshops and kickoffs if travel is feasible.',
      },
      {
        question: 'What tools do you use for collaboration?',
        answer:
          'We adapt to your workflow. Common tools include Slack for daily communication, Figma for design reviews, Linear or Notion for project tracking, and GitHub for code. We keep everything transparent and accessible.',
      },
      {
        question: 'What if I need changes after the project is done?',
        answer:
          'Minor tweaks within 30 days of launch are included free. For larger changes or new features, we scope them as a follow-up engagement or fold them into a retainer. We don\'t nickel-and-dime.',
      },
    ],
  },
];
