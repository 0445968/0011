# Design Blade — Creative Studio & Resource Library

A premium, production-quality portfolio platform for an independent creative studio, with a built-in journal (blog), a HubSpot-style resource library (guides, tools, curated links), an integrations showcase, and dedicated section pages behind a megamenu navigation. Built with Next.js (App Router), TypeScript, Tailwind CSS, and Framer Motion.

This is a **frontend-only** application — no authentication, database, or backend. All content lives in the `/data` folder and is imported by components.

**Domain:** [designblade.pro](https://designblade.pro)

---

## Project Structure

```
/app
  /page.tsx                      # Homepage — composes portfolio sections
  /about                         # Dedicated About page
  /services                      # Dedicated Services page
  /work                          # Dedicated Work + Testimonials page
  /process                       # Dedicated Process / case study page
  /contact                       # Dedicated Contact page
  /integrations                  # Integrations browser (browse-by-type tabs)
  /resources
    /page.tsx                    # Resource Library listing (filters + search)
    /color-palette-generator     # Interactive color palette generator tool
    /[slug]                      # Dynamic guide detail / download page
  /blog
    /page.tsx                    # Blog listing (Journal)
    /[slug]                      # Dynamic blog post route
  /templates
    /[templateName]              # Dynamic route for standalone template demos
  /layout.tsx                    # Root layout, fonts, metadata, Navbar + Footer
  /globals.css                   # Design tokens (CSS variables) + base styles

/components
  /layout
    Navbar.tsx                   # Sticky nav with megamenu + mobile drawer
    Footer.tsx                   # Footer with links, socials, availability
    PageHeader.tsx               # Shared hero header for dedicated pages
    PageTransition.tsx           # Framer Motion page transition wrapper
  /portfolio
    Hero.tsx                     # Full-viewport hero with parallax + marquee
    About.tsx                    # Editorial about + stats
    Services.tsx                 # Service cards + integrations teaser
    Stacks.tsx                   # Compact integrations teaser (links to full page)
    IntegrationsBrowser.tsx      # Full integrations grid with type tabs
    ColorPaletteGenerator.tsx    # Interactive palette generator tool
    Projects.tsx                 # Project showcase grid
    ResourceLibraryPreview.tsx   # Homepage resource library preview
    CaseStudy.tsx                # Process + results case study
    Testimonials.tsx             # Auto-rotating testimonial carousel
    BlogPreview.tsx              # Latest articles preview on homepage
    Contact.tsx                  # Contact form UI + socials
    Reveal.tsx                   # Shared scroll-reveal animation primitives
  /blog
    BlogCard.tsx                 # Reusable article card
    BlogList.tsx                 # Filterable blog listing view
    ArticleContent.tsx           # Renders structured blog post blocks
  /resources
    ResourceCard.tsx             # Reusable resource card
    ResourceLibrary.tsx          # Filterable, searchable resource listing
  /templates
    TemplateCard.tsx             # Reusable template card
    TemplatePreview.tsx          # Reusable template detail/preview layout
    TemplateCategory.tsx         # Category summary card

/data
  site.ts                        # Brand config, nav sections, megamenu, socials
  projects.ts                    # Portfolio projects
  templates.ts                   # Website templates/resources + helpers
  services.ts                    # Service offerings
  stacks.ts                      # Integration icons + colours (auto-generated)
  resources.ts                   # Resource library: guides, tools, articles, links
  blog.ts                        # Blog posts + categories + helpers
  testimonials.ts                # Client testimonials
  casestudy.ts                   # Case study content

/lib
  utils.ts                       # cn() class merge helper

/public
  /images
    /projects/*.svg              # Project preview images
    /blog/*.svg                  # Blog cover images
    /resources/*.svg             # Resource preview images
    og-image.svg                 # Open Graph share image
  /templates/*.svg               # Template preview images
  /resources/*.pdf               # Downloadable guide PDFs (placeholders)

/scripts
  generate-assets.mjs            # Regenerates project + template placeholder SVGs
  generate-stacks.mjs            # Regenerates data/stacks.ts from simple-icons
```

---

## Design System

- **Typography:** Sora (headings, via `next/font`) + Inter (body). Headings use the `font-heading` utility class.
- **Colour:** Warm neutral palette with a coral accent (`--accent`). Full token set in `app/globals.css` (`:root` and `.dark`), including success/warning/error ramps. Dark mode is wired via the `.dark` class.
- **Spacing:** 8px-based, with `.container-page`, `.container-prose`, and `.section-spacing` utilities.
- **Motion:** Framer Motion for scroll reveals, stagger, parallax, page transitions, and micro-interactions. Shared primitives live in `components/portfolio/Reveal.tsx`.

---

## Navigation & Megamenu

The navbar has two layers:

1. **Top-level sections** — About, Services, Work, Resources, Integrations, Journal — each linking to its own dedicated page (`/about`, `/services`, etc.).
2. **"Browse all" megamenu** — a four-column dropdown detailing every type of page on the site: Studio (About, Services, Integrations, Contact), Work (All Projects, Process, Testimonials), Resource Library (Browse all, Guides & PDFs, Tools, Articles, Curated Links), and Journal (All Articles, Design, Engineering, UX).

The megamenu structure is defined in `data/site.ts` (`megaMenu` array). On mobile, the drawer lists every section plus every megamenu link.

---

## Resource Library

A HubSpot-style library at `/resources` with four resource types:

| Type | What it is | Examples |
| --- | --- | --- |
| `guide` | Downloadable PDF guides | Brand Identity Guide, Color Systems Handbook, SaaS Launch Checklist, Typography Playbook |
| `tool` | Interactive tools | Color Palette Generator, Contrast Checker, Tailwind Config Generator |
| `article` | Essays and deep dives | Design that feels inevitable, Typography is the interface |
| `link` | Curated external links | USPTO Trademarks, EUIPO, Google Patents, Namelix, It's Nice That, Brand New, Marketing Week |

### How to add a resource

1. Open `data/resources.ts`.
2. Add an object to the `resources` array with a `type` of `guide`, `tool`, `article`, or `link`.
3. For downloadable guides, add the PDF to `/public/resources/<slug>.pdf`.
4. For interactive tools, create a route at `/app/resources/<slug>/page.tsx`.
5. For curated links, set `external: true` and the `href` to the external URL.
6. The resource appears automatically in the library, the homepage preview, and the megamenu.

### Color Palette Generator

An interactive tool at `/resources/color-palette-generator` — generates accessible palettes with live WCAG contrast checking, lockable swatches, click-to-copy hex values, and CSS variable export. Built as a self-contained client component.

---

## Integrations

The integrations page (`/integrations`) shows all 25 tools in one grid, with tabs to browse by type: **All**, **Design**, **Development**, **Project Management**, and **Branding & Commerce**. Each integration renders its real brand logo (in brand colours) via data auto-generated from `simple-icons`.

To add or remove an integration, edit the `picks` array in `scripts/generate-stacks.mjs` and run `node scripts/generate-stacks.mjs`.

The Services section on the homepage and `/services` page shows a compact teaser that links to the full integrations page.

---

## Dedicated Section Pages

Each nav section has its own page, composed from the same reusable components as the homepage:

| Page | Route | Components reused |
| --- | --- | --- |
| About | `/about` | `About` |
| Services | `/services` | `Services` (includes integrations teaser) |
| Work | `/work` | `Projects`, `Testimonials` |
| Process | `/process` | `CaseStudy` |
| Contact | `/contact` | `Contact` |
| Integrations | `/integrations` | `IntegrationsBrowser` |
| Resources | `/resources` | `ResourceLibrary` |
| Journal | `/blog` | `BlogList` |

Each dedicated page uses the shared `PageHeader` component for a consistent hero.

---

## How to Add a Blog Post

1. Open `data/blog.ts`.
2. Add an object to the `blogPosts` array with `slug`, `title`, `excerpt`, `category`, `content` (structured blocks), and a cover image at `/public/images/blog/<slug>.svg`.
3. The post appears at `/blog/<slug>` automatically (statically generated), in the Journal listing, and in the homepage preview.

Supported block types: `paragraph`, `heading`, `quote`, `list`.

---

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |
| `node scripts/generate-assets.mjs` | Regenerate project & template placeholder SVGs |
| `node scripts/generate-stacks.mjs` | Regenerate `data/stacks.ts` integration icons |

---

## Tech Stack

- **Next.js** (App Router) + **TypeScript**
- **Tailwind CSS** with a token-based design system
- **Framer Motion** for animation
- **Sora** + **Inter** fonts via `next/font`
- **lucide-react** for UI icons; **simple-icons** for brand logos in Integrations
- No backend, no database, no auth — pure frontend.
