export interface ServicePage {
  slug: string;
  title: string;
  eyebrow: string;

  hero: {
    headline: string;
    description: string;
  };

  intro: {
    eyebrow: string;
    title: string;
    description: string;
  };

  capabilities: {
    title: string;
    description?: string;
    items: string[];
  };

  outcomes: {
    eyebrow: string;
    title: string;
    description: string;
    items: {
      title: string;
      description: string;
    }[];
  };

  process: {
    eyebrow: string;
    title: string;
    description: string;
    steps: {
      number: string;
      title: string;
      description: string;
    }[];
  };

  relatedServices: string[];

  seo: {
    title: string;
    description: string;
  };
}

export const servicePages: ServicePage[] = [
  /* ==========================================================================
   * BRANDING SERVICES
   * ========================================================================== */

  {
    slug: 'branding-services',
    title: 'Branding Services',
    eyebrow: 'Branding Services',

    hero: {
      headline:
        'Make your business unmistakably yours',
      description:
        'We build distinctive brand systems that help businesses become easier to recognize, understand, and remember.',
    },

    intro: {
      eyebrow: 'Build recognition',
      title:
        'A stronger business starts with a clearer identity',
      description:
        'Your brand is more than a logo. It is the system people use to recognize you, understand what you stand for, and decide whether you feel right for them. We bring strategy, identity, and visual direction together into one cohesive foundation.',
    },

    capabilities: {
      title: 'What we can help with',
      description:
        'From early-stage identities to established businesses ready for a clearer visual direction.',
      items: [
        'Brand strategy',
        'Visual identity',
        'Logo systems',
        'Typography',
        'Color systems',
        'Art direction',
        'Brand guidelines',
        'Brand applications',
        'Identity refreshes',
        'Visual system development',
      ],
    },

    outcomes: {
      eyebrow: 'Built to last',
      title:
        'A brand system your business can actually use.',
      description:
        'We create more than isolated assets. We build a visual foundation designed to make everyday decisions easier and your business more consistent.',
      items: [
        {
          title: 'Stronger recognition',
          description:
            'Create a consistent visual presence that becomes easier for people to identify over time.',
        },
        {
          title: 'Clearer direction',
          description:
            'Give your team a shared visual foundation for future creative and marketing decisions.',
        },
        {
          title: 'More consistency',
          description:
            'Bring your website, social media, presentations, print, and other touchpoints together.',
        },
        {
          title: 'Room to grow',
          description:
            'Build a flexible identity that can expand with new products, services, and audiences.',
        },
      ],
    },

    process: {
      eyebrow: 'Our approach',
      title:
        'From understanding your business to building the system around it.',
      description:
        'Every identity begins with clarity before moving into visual exploration and execution.',
      steps: [
        {
          number: '01',
          title: 'Understand',
          description:
            'We learn how your business works, where it is heading, who it serves, and what needs to change.',
        },
        {
          number: '02',
          title: 'Define',
          description:
            'We establish the strategic and creative direction that will guide the identity.',
        },
        {
          number: '03',
          title: 'Create',
          description:
            'We develop the visual system, test how the pieces work together, and refine the strongest direction.',
        },
        {
          number: '04',
          title: 'Deliver',
          description:
            'We organize the final identity into practical assets and guidelines your team can use confidently.',
        },
      ],
    },

    relatedServices: [
      'creative-direction',
      'web-design',
      'packaging-merch-design',
    ],

    seo: {
      title: 'Branding Services | Bivi',
      description:
        'Brand strategy, visual identity, logo systems, guidelines, and creative direction designed to help businesses become more recognizable and consistent.',
    },
  },

  /* ==========================================================================
   * CREATIVE DIRECTION
   * ========================================================================== */

  {
    slug: 'creative-direction',
    title: 'Creative Direction',
    eyebrow: 'Creative Direction',

    hero: {
      headline:
        'Give every creative decision a clear direction',
      description:
        'We help businesses turn scattered ideas into cohesive visual systems, campaigns, and brand experiences.',
    },

    intro: {
      eyebrow: 'Create with purpose',
      title:
        'Good ideas work better when they belong to the same world',
      description:
        'Creative direction establishes the visual logic behind your business. We define how ideas should look, feel, move, and work together so every execution supports the same bigger picture.',
    },

    capabilities: {
      title: 'What we can help with',
      items: [
        'Creative strategy',
        'Art direction',
        'Visual direction',
        'Concept development',
        'Campaign direction',
        'Launch direction',
        'Photography direction',
        'Content direction',
        'Design system direction',
        'Creative reviews',
      ],
    },

    outcomes: {
      eyebrow: 'One clear vision',
      title:
        'Creative work that feels connected instead of pieced together.',
      description:
        'A clear creative direction makes it easier to produce consistent work across teams, channels, and campaigns.',
      items: [
        {
          title: 'A stronger point of view',
          description:
            'Establish a recognizable creative perspective that separates your business from generic category conventions.',
        },
        {
          title: 'Better consistency',
          description:
            'Create visual principles that keep different pieces of creative work connected.',
        },
        {
          title: 'Faster decisions',
          description:
            'Give teams clear creative parameters so fewer decisions have to be reinvented from scratch.',
        },
        {
          title: 'More cohesive launches',
          description:
            'Connect campaigns, content, web, social, and supporting materials around one central idea.',
        },
      ],
    },

    process: {
      eyebrow: 'Our approach',
      title:
        'Define the idea before designing everything around it.',
      description:
        'We start by establishing what the creative needs to accomplish, then build the visual language around that goal.',
      steps: [
        {
          number: '01',
          title: 'Explore',
          description:
            'We review your brand, audience, goals, references, and existing creative environment.',
        },
        {
          number: '02',
          title: 'Direct',
          description:
            'We establish the central visual idea, tone, references, and creative principles.',
        },
        {
          number: '03',
          title: 'Develop',
          description:
            'We translate the direction into key applications and test how it works across different formats.',
        },
        {
          number: '04',
          title: 'Guide',
          description:
            'We provide the system and direction needed to keep future creative work aligned.',
        },
      ],
    },

    relatedServices: [
      'branding-services',
      'campaign-strategy',
      'social-media-creative',
    ],

    seo: {
      title: 'Creative Direction Services | Bivi',
      description:
        'Creative direction, art direction, campaign concepts, visual direction, and creative systems for brands and businesses.',
    },
  },

  /* ==========================================================================
   * PACKAGING & MERCH DESIGN
   * ========================================================================== */

  {
    slug: 'packaging-merch-design',
    title: 'Packaging & Merch Design',
    eyebrow: 'Packaging & Merch Design',

    hero: {
      headline:
        'Bring your brand into the physical world',
      description:
        'We design packaging and merchandise that feel like a natural extension of your brand rather than an afterthought.',
    },

    intro: {
      eyebrow: 'Make it tangible',
      title:
        'The experience does not stop at the screen',
      description:
        'Packaging and merchandise create some of the most tangible interactions people have with a brand. We turn your visual identity into physical experiences designed to feel distinctive, useful, and memorable.',
    },

    capabilities: {
      title: 'What we can help with',
      items: [
        'Packaging concepts',
        'Packaging systems',
        'Labels',
        'Boxes and mailers',
        'Product packaging',
        'Merchandise graphics',
        'Apparel graphics',
        'Branded merchandise',
        'Packaging mockups',
        'Production-ready artwork',
      ],
    },

    outcomes: {
      eyebrow: 'Made to be remembered',
      title:
        'Physical design that strengthens the rest of your brand.',
      description:
        'We create packaging and merchandise that work alongside your identity instead of competing with it.',
      items: [
        {
          title: 'Stronger shelf presence',
          description:
            'Create packaging that is easier to recognize and distinguish in competitive environments.',
        },
        {
          title: 'Better brand consistency',
          description:
            'Extend your existing identity into physical products without losing what makes it recognizable.',
        },
        {
          title: 'More memorable moments',
          description:
            'Turn receiving, opening, wearing, or using your product into part of the brand experience.',
        },
        {
          title: 'Production-ready systems',
          description:
            'Receive organized artwork designed with real-world production requirements in mind.',
        },
      ],
    },

    process: {
      eyebrow: 'Our approach',
      title:
        'Designing from concept to physical application.',
      description:
        'We balance visual impact with practical considerations like format, production, materials, and use.',
      steps: [
        {
          number: '01',
          title: 'Define',
          description:
            'We establish the product, audience, production needs, and role the design should play.',
        },
        {
          number: '02',
          title: 'Explore',
          description:
            'We develop visual directions that connect the physical product with the wider brand.',
        },
        {
          number: '03',
          title: 'Apply',
          description:
            'We translate the selected direction across packaging, merchandise, and supporting applications.',
        },
        {
          number: '04',
          title: 'Prepare',
          description:
            'We organize final artwork and production-ready files for implementation.',
        },
      ],
    },

    relatedServices: [
      'branding-services',
      'creative-direction',
      'print-design',
    ],

    seo: {
      title: 'Packaging & Merch Design | Bivi',
      description:
        'Packaging design, merchandise design, product labels, apparel graphics, and physical brand applications.',
    },
  },

  /* ==========================================================================
   * PRESENTATION DESIGN
   * ========================================================================== */

  {
    slug: 'presentation-design',
    title: 'Presentation Design',
    eyebrow: 'Presentation Design',

    hero: {
      headline:
        'Make important ideas easier to follow',
      description:
        'We design clear, polished presentations that help businesses explain ideas, tell stories, and make stronger impressions.',
    },

    intro: {
      eyebrow: 'Present with clarity',
      title:
        'A good presentation should make the message feel simpler',
      description:
        'We turn information into structured visual stories. From investor decks to internal presentations, every slide is designed to help the audience understand what matters and where to focus.',
    },

    capabilities: {
      title: 'What we can help with',
      items: [
        'Pitch decks',
        'Investor presentations',
        'Sales presentations',
        'Company presentations',
        'Internal presentations',
        'Keynote presentations',
        'Presentation templates',
        'Data visualization',
        'Slide systems',
        'Presentation redesigns',
      ],
    },

    outcomes: {
      eyebrow: 'Communicate better',
      title:
        'Presentations designed around the message, not decoration.',
      description:
        'We use structure, hierarchy, pacing, and visual consistency to make complex information easier to absorb.',
      items: [
        {
          title: 'Clearer storytelling',
          description:
            'Organize information into a sequence that helps audiences understand the main idea.',
        },
        {
          title: 'Better visual hierarchy',
          description:
            'Make the most important information immediately easier to identify.',
        },
        {
          title: 'A consistent system',
          description:
            'Create reusable layouts and visual rules your team can continue using.',
        },
        {
          title: 'More polished communication',
          description:
            'Bring presentations into the same visual world as the rest of your brand.',
        },
      ],
    },

    process: {
      eyebrow: 'Our approach',
      title:
        'Structure first. Design second.',
      description:
        'We begin with what the audience needs to understand, then design the visual system around that story.',
      steps: [
        {
          number: '01',
          title: 'Organize',
          description:
            'We review the existing content and determine the strongest narrative structure.',
        },
        {
          number: '02',
          title: 'Simplify',
          description:
            'We identify the key information and reduce unnecessary visual and messaging complexity.',
        },
        {
          number: '03',
          title: 'Design',
          description:
            'We create a presentation system with consistent layouts, hierarchy, typography, and imagery.',
        },
        {
          number: '04',
          title: 'Deliver',
          description:
            'We prepare the final presentation and reusable components for future updates.',
        },
      ],
    },

    relatedServices: [
      'branding-services',
      'creative-direction',
      'print-design',
    ],

    seo: {
      title: 'Presentation Design Services | Bivi',
      description:
        'Presentation design for pitch decks, investor decks, sales presentations, company presentations, and reusable slide systems.',
    },
  },

  /* ==========================================================================
   * PRINT DESIGN
   * ========================================================================== */

  {
    slug: 'print-design',
    title: 'Print Design',
    eyebrow: 'Print Design',

    hero: {
      headline:
        'Create something worth holding onto',
      description:
        'We design thoughtful print materials that bring your brand into physical spaces with clarity and character.',
    },

    intro: {
      eyebrow: 'Beyond the screen',
      title:
        'Print gives your brand a different kind of presence',
      description:
        'From simple business collateral to larger editorial systems, we translate your visual identity into physical materials that feel considered, consistent, and useful.',
    },

    capabilities: {
      title: 'What we can help with',
      items: [
        'Brochures',
        'Booklets',
        'Catalogs',
        'Editorial layouts',
        'Business cards',
        'Stationery',
        'Posters',
        'Flyers',
        'Event materials',
        'Print-ready production files',
      ],
    },

    outcomes: {
      eyebrow: 'Designed for the real world',
      title:
        'Print that feels like part of the brand.',
      description:
        'Every piece is designed to work within your wider visual system while making the most of the physical format.',
      items: [
        {
          title: 'More consistency',
          description:
            'Carry your visual identity into printed materials without losing its character.',
        },
        {
          title: 'Better communication',
          description:
            'Use hierarchy and layout to make information easier to navigate and understand.',
        },
        {
          title: 'A more polished presence',
          description:
            'Create materials that feel intentional when handed to customers, partners, or teams.',
        },
        {
          title: 'Production-ready files',
          description:
            'Receive final artwork prepared for professional printing and implementation.',
        },
      ],
    },

    process: {
      eyebrow: 'Our approach',
      title:
        'Designed with the final format in mind.',
      description:
        'Print has its own constraints and opportunities, so we consider format, hierarchy, materials, and production from the beginning.',
      steps: [
        {
          number: '01',
          title: 'Plan',
          description:
            'We define the content, format, audience, and practical requirements.',
        },
        {
          number: '02',
          title: 'Design',
          description:
            'We develop a visual system that works with both your brand and the physical format.',
        },
        {
          number: '03',
          title: 'Refine',
          description:
            'We improve hierarchy, layout, pacing, and production details.',
        },
        {
          number: '04',
          title: 'Prepare',
          description:
            'We deliver organized, print-ready files prepared for production.',
        },
      ],
    },

    relatedServices: [
      'branding-services',
      'packaging-merch-design',
      'presentation-design',
    ],

    seo: {
      title: 'Print Design Services | Bivi',
      description:
        'Print design for brochures, catalogs, editorial layouts, business collateral, posters, stationery, and other physical brand materials.',
    },
  },

  /* ==========================================================================
   * WEB DESIGN
   * ========================================================================== */

  {
    slug: 'web-design',
    title: 'Web & Digital',
    eyebrow: 'Web & Digital',

    hero: {
      headline:
        'Turn your website into your strongest first impression',
      description:
        'We design and build distinctive websites that make businesses easier to understand, trust, and choose.',
    },

    intro: {
      eyebrow: 'Make every visit count',
      title:
        'Your website should make the next move obvious',
      description:
        'We combine strategy, user experience, visual design, interaction, and development into one connected process. The result is a website that not only looks considered, but works hard for the business behind it.',
    },

    capabilities: {
      title: 'What we can help with',
      description:
        'From focused landing pages to complete marketing websites.',
      items: [
        'Website strategy',
        'Information architecture',
        'Wireframing',
        'Responsive web design',
        'Landing pages',
        'Interaction design',
        'Design systems',
        'Frontend development',
        'Next.js development',
        'Performance optimization',
      ],
    },

    outcomes: {
      eyebrow: 'Designed to work',
      title:
        'A website that gives your business a clearer digital home.',
      description:
        'Every decision is made around helping visitors understand who you are, what you offer, and what they should do next.',
      items: [
        {
          title: 'A clearer customer journey',
          description:
            'Organize pages and information around how visitors actually explore and make decisions.',
        },
        {
          title: 'Stronger first impressions',
          description:
            'Create a digital experience that reflects the quality and personality of your business.',
        },
        {
          title: 'Better conversion paths',
          description:
            'Make important calls to action and next steps easier to understand and access.',
        },
        {
          title: 'A system that can grow',
          description:
            'Build reusable components and page patterns that support future content and expansion.',
        },
      ],
    },

    process: {
      eyebrow: 'Our approach',
      title:
        'Strategy, design, and development in one connected process.',
      description:
        'We think about the entire website rather than treating design and development as separate stages.',
      steps: [
        {
          number: '01',
          title: 'Plan',
          description:
            'We define goals, audiences, content priorities, page structure, and the role the website needs to play.',
        },
        {
          number: '02',
          title: 'Design',
          description:
            'We establish the visual direction, layouts, interaction patterns, and responsive system.',
        },
        {
          number: '03',
          title: 'Build',
          description:
            'We develop the approved experience with performance, responsiveness, and maintainability in mind.',
        },
        {
          number: '04',
          title: 'Launch',
          description:
            'We refine the final experience, test important flows, and prepare the site for release.',
        },
      ],
    },

    relatedServices: [
      'branding-services',
      'creative-direction',
      'email-design',
    ],

    seo: {
      title: 'Web & Digital & Development | Bivi',
      description:
        'Website strategy, responsive web design, frontend development, landing pages, interaction design, and modern Next.js websites.',
    },
  },

  /* ==========================================================================
   * MOBILE APP DESIGN
   * ========================================================================== */

  {
    slug: 'mobile-app-design',
    title: 'Mobile App Design',
    eyebrow: 'Mobile App Design',

    hero: {
      headline:
        'Make complex interactions feel natural',
      description:
        'We design focused mobile experiences that make products easier to understand, navigate, and use.',
    },

    intro: {
      eyebrow: 'Designed for everyday use',
      title:
        'The best mobile experiences feel obvious',
      description:
        'We turn product requirements and complex workflows into clear mobile interfaces designed around real user behavior.',
    },

    capabilities: {
      title: 'What we can help with',
      items: [
        'Mobile product strategy',
        'User flows',
        'Wireframes',
        'Mobile UX',
        'Interface design',
        'Design systems',
        'Interactive prototypes',
        'iOS interfaces',
        'Android interfaces',
        'Existing app redesigns',
      ],
    },

    outcomes: {
      eyebrow: 'Less friction',
      title:
        'A product that feels easier from the first interaction.',
      description:
        'We reduce unnecessary complexity while building flexible interface systems that support both users and product teams.',
      items: [
        {
          title: 'Clearer workflows',
          description:
            'Make important tasks easier to understand and complete.',
        },
        {
          title: 'More consistent interfaces',
          description:
            'Create reusable patterns that keep the experience predictable.',
        },
        {
          title: 'Better usability',
          description:
            'Design screens around real actions instead of visual decoration.',
        },
        {
          title: 'A scalable system',
          description:
            'Give future features a clear interface foundation to build from.',
        },
      ],
    },

    process: {
      eyebrow: 'Our approach',
      title:
        'Start with the workflow, then design the interface around it.',
      description:
        'We prioritize how the product should work before deciding how each screen should look.',
      steps: [
        {
          number: '01',
          title: 'Understand',
          description:
            'We define users, product goals, technical constraints, and important workflows.',
        },
        {
          number: '02',
          title: 'Map',
          description:
            'We organize user journeys, navigation, information architecture, and core flows.',
        },
        {
          number: '03',
          title: 'Design',
          description:
            'We develop the interface system and refine the most important screens and interactions.',
        },
        {
          number: '04',
          title: 'Prototype',
          description:
            'We connect key flows into testable experiences and prepare the system for implementation.',
        },
      ],
    },

    relatedServices: [
      'web-design',
      'branding-services',
      'creative-direction',
    ],

    seo: {
      title: 'Mobile App Design Services | Bivi',
      description:
        'Mobile UX, interface design, user flows, prototypes, design systems, and polished iOS and Android product experiences.',
    },
  },

  /* ==========================================================================
   * CAMPAIGN STRATEGY
   * ========================================================================== */

  {
    slug: 'campaign-strategy',
    title: 'Campaign Strategy',
    eyebrow: 'Campaign Strategy',

    hero: {
      headline:
        'Give your next campaign a reason to be noticed',
      description:
        'We create focused campaign strategies and creative systems that connect the idea, message, and execution.',
    },

    intro: {
      eyebrow: 'Start with the idea',
      title:
        'Good campaigns need more than a collection of assets',
      description:
        'We establish the central idea, message, visual direction, and execution framework so every campaign touchpoint works toward the same goal.',
    },

    capabilities: {
      title: 'What we can help with',
      items: [
        'Campaign strategy',
        'Creative concepts',
        'Campaign messaging',
        'Launch strategy',
        'Visual direction',
        'Campaign systems',
        'Digital campaign assets',
        'Paid media creative',
        'Launch materials',
        'Creative rollout planning',
      ],
    },

    outcomes: {
      eyebrow: 'One idea, many touchpoints',
      title:
        'Campaigns that feel connected wherever people encounter them.',
      description:
        'We create a strong central direction that can expand across channels without losing its core message.',
      items: [
        {
          title: 'A stronger central idea',
          description:
            'Give the campaign a recognizable concept rather than a collection of unrelated executions.',
        },
        {
          title: 'Clearer messaging',
          description:
            'Define what the audience needs to understand and how that message should be expressed.',
        },
        {
          title: 'More consistent creative',
          description:
            'Connect ads, social content, landing pages, email, and other campaign assets.',
        },
        {
          title: 'A flexible rollout system',
          description:
            'Create a framework that can adapt across formats, placements, and campaign phases.',
        },
      ],
    },

    process: {
      eyebrow: 'Our approach',
      title:
        'Build the idea first, then create the system around it.',
      description:
        'We connect strategy and creative direction before expanding the campaign across individual assets.',
      steps: [
        {
          number: '01',
          title: 'Define',
          description:
            'We establish the campaign goal, audience, offer, context, and key message.',
        },
        {
          number: '02',
          title: 'Concept',
          description:
            'We develop the central creative idea and visual direction.',
        },
        {
          number: '03',
          title: 'Build',
          description:
            'We translate the concept into a flexible system for different channels and formats.',
        },
        {
          number: '04',
          title: 'Extend',
          description:
            'We prepare the campaign framework and supporting creative for rollout.',
        },
      ],
    },

    relatedServices: [
      'creative-direction',
      'social-media-creative',
      'email-design',
    ],

    seo: {
      title: 'Campaign Strategy Services | Bivi',
      description:
        'Campaign strategy, creative concepts, launch strategy, messaging, art direction, digital campaign assets, and campaign systems.',
    },
  },

  /* ==========================================================================
   * SOCIAL MEDIA CREATIVE
   * ========================================================================== */

  {
    slug: 'social-media-creative',
    title: 'Social Media Creative',
    eyebrow: 'Social Media Creative',

    hero: {
      headline:
        'Make your social presence feel like your brand',
      description:
        'We create flexible social media systems that help businesses stay recognizable without making every post look the same.',
    },

    intro: {
      eyebrow: 'Stay recognizable',
      title:
        'Consistency does not have to mean repetition',
      description:
        'We create visual systems that give your social content a recognizable personality while leaving enough flexibility for different formats, ideas, campaigns, and platforms.',
    },

    capabilities: {
      title: 'What we can help with',
      items: [
        'Social media systems',
        'Post templates',
        'Story templates',
        'Campaign creative',
        'Paid social creative',
        'Content graphics',
        'Launch content',
        'Motion direction',
        'Creative testing systems',
        'Social visual guidelines',
      ],
    },

    outcomes: {
      eyebrow: 'Create with more consistency',
      title:
        'A social system that makes everyday content easier to produce.',
      description:
        'We create reusable visual principles instead of designing isolated posts one at a time.',
      items: [
        {
          title: 'Stronger recognition',
          description:
            'Make content easier to associate with your business while people move quickly through their feeds.',
        },
        {
          title: 'More flexibility',
          description:
            'Use a system that supports different content types without losing its visual identity.',
        },
        {
          title: 'Faster production',
          description:
            'Give internal teams and collaborators reusable patterns for everyday content creation.',
        },
        {
          title: 'Better campaign consistency',
          description:
            'Connect ongoing social content with launches, campaigns, and your broader brand system.',
        },
      ],
    },

    process: {
      eyebrow: 'Our approach',
      title:
        'Build the system, not just the posts.',
      description:
        'We identify the recurring needs of your social presence and create a flexible visual toolkit around them.',
      steps: [
        {
          number: '01',
          title: 'Audit',
          description:
            'We review the brand, existing content, channels, and recurring communication needs.',
        },
        {
          number: '02',
          title: 'Define',
          description:
            'We establish the social visual language, hierarchy, content patterns, and creative direction.',
        },
        {
          number: '03',
          title: 'Create',
          description:
            'We design reusable formats across the most important post and campaign types.',
        },
        {
          number: '04',
          title: 'Systemize',
          description:
            'We organize the creative into a practical system your team can continue using.',
        },
      ],
    },

    relatedServices: [
      'campaign-strategy',
      'creative-direction',
      'branding-services',
    ],

    seo: {
      title: 'Social Media Creative Services | Bivi',
      description:
        'Social media design systems, post templates, campaign creative, paid social assets, content graphics, and flexible visual systems.',
    },
  },

  /* ==========================================================================
   * EMAIL DESIGN
   * ========================================================================== */

  {
    slug: 'email-design',
    title: 'Email Design',
    eyebrow: 'Email Design',

    hero: {
      headline:
        'Make every send feel more like your brand',
      description:
        'We design clear, recognizable email systems that turn newsletters, campaigns, and automated messages into stronger brand experiences.',
    },

    intro: {
      eyebrow: 'Designed for the inbox',
      title:
        'Email should feel connected to everything around it',
      description:
        'We bring your identity, messaging, hierarchy, and calls to action into a flexible email system designed for real campaigns and recurring communication.',
    },

    capabilities: {
      title: 'What we can help with',
      items: [
        'Email campaigns',
        'Newsletter design',
        'Email templates',
        'Automated flows',
        'Welcome sequences',
        'Launch emails',
        'Promotional emails',
        'Transactional email design',
        'Email design systems',
        'Responsive email layouts',
      ],
    },

    outcomes: {
      eyebrow: 'More than another email',
      title:
        'An inbox experience that feels recognizably yours.',
      description:
        'We create reusable systems that balance strong visual identity with readability, hierarchy, and action.',
      items: [
        {
          title: 'Stronger recognition',
          description:
            'Create a consistent email presence that feels connected to your broader brand.',
        },
        {
          title: 'Clearer hierarchy',
          description:
            'Make important messages, offers, and calls to action easier to identify.',
        },
        {
          title: 'Reusable templates',
          description:
            'Create flexible layouts that support recurring campaigns without starting from scratch.',
        },
        {
          title: 'More consistent journeys',
          description:
            'Connect newsletters, launches, promotions, and automated messages into one visual system.',
        },
      ],
    },

    process: {
      eyebrow: 'Our approach',
      title:
        'Design a system your team can keep using.',
      description:
        'We consider recurring communication needs from the beginning so the final design works beyond a single campaign.',
      steps: [
        {
          number: '01',
          title: 'Review',
          description:
            'We examine your brand, existing email program, content needs, and important campaign types.',
        },
        {
          number: '02',
          title: 'Structure',
          description:
            'We establish hierarchy, modular content sections, and the core email system.',
        },
        {
          number: '03',
          title: 'Design',
          description:
            'We apply your visual identity across responsive templates and key email examples.',
        },
        {
          number: '04',
          title: 'Extend',
          description:
            'We prepare reusable patterns that can support future newsletters, campaigns, and automated flows.',
        },
      ],
    },

    relatedServices: [
      'campaign-strategy',
      'social-media-creative',
      'web-design',
    ],

    seo: {
      title: 'Email Design Services | Bivi',
      description:
        'Email campaign design, newsletters, responsive templates, automated flows, promotional emails, and branded email systems.',
    },
  },
];

/* ==========================================================================
 * HELPERS
 * ========================================================================== */

export function getServicePage(
  slug: string
): ServicePage | undefined {
  return servicePages.find(
    (service) =>
      service.slug === slug
  );
}

export function getServicePageSlugs() {
  return servicePages.map(
    (service) =>
      service.slug
  );
}