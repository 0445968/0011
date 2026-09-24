'use client';

import type {
  ComponentType,
  SVGProps,
} from 'react';

import {
  AppWindow,
  Badge,
  BookOpen,
  Box,
  BriefcaseBusiness,
  Brush,
  ChartNoAxesCombined,
  FileChartColumn,
  FileImage,
  FileText,
  Flag,
  Frame,
  GalleryHorizontalEnd,
  Image,
  Images,
  LayoutDashboard,
  Mail,
  Megaphone,
  Monitor,
  MousePointerClick,
  Package,
  PanelsTopLeft,
  Presentation,
  Printer,
  Send,
  Shirt,
  Smartphone,
  Sparkles,
  Sticker,
  Store,
  Target,
  Type,
  Video,
  type LucideIcon,
} from 'lucide-react';

type ServiceProductStripProps = {
  service: {
    slug: string;
    title: string;
  };
};

type ProductItem = {
  label: string;
  icon: LucideIcon;
};

const serviceProducts: Record<
  string,
  ProductItem[]
> = {
  'branding-services': [
    {
      label: 'Logo Systems',
      icon: Sparkles,
    },
    {
      label: 'Brand Guidelines',
      icon: BookOpen,
    },
    {
      label: 'Visual Identity',
      icon: Frame,
    },
    {
      label: 'Brand Templates',
      icon: PanelsTopLeft,
    },
    {
      label: 'Typography Systems',
      icon: Type,
    },
    {
      label: 'Brand Collateral',
      icon: BriefcaseBusiness,
    },
    {
      label: 'Social Brand Kits',
      icon: Images,
    },
    {
      label: 'Identity Refreshes',
      icon: Brush,
    },
  ],

  'creative-direction': [
    {
      label: 'Art Direction',
      icon: Brush,
    },
    {
      label: 'Campaign Direction',
      icon: Megaphone,
    },
    {
      label: 'Photography Direction',
      icon: Image,
    },
    {
      label: 'Motion Direction',
      icon: Video,
    },
    {
      label: 'Visual Concepts',
      icon: Sparkles,
    },
    {
      label: 'Content Direction',
      icon: GalleryHorizontalEnd,
    },
    {
      label: 'Launch Creative',
      icon: Flag,
    },
    {
      label: 'Creative Systems',
      icon: Frame,
    },
  ],

  'packaging-merch-design': [
    {
      label: 'Product Packaging',
      icon: Package,
    },
    {
      label: 'Labels',
      icon: Sticker,
    },
    {
      label: 'Boxes & Mailers',
      icon: Box,
    },
    {
      label: 'Apparel',
      icon: Shirt,
    },
    {
      label: 'Branded Merch',
      icon: Store,
    },
    {
      label: 'Retail Packaging',
      icon: Package,
    },
    {
      label: 'Promotional Items',
      icon: Badge,
    },
    {
      label: 'Packaging Systems',
      icon: Frame,
    },
  ],

  'presentation-design': [
    {
      label: 'Pitch Decks',
      icon: Presentation,
    },
    {
      label: 'Investor Decks',
      icon: ChartNoAxesCombined,
    },
    {
      label: 'Sales Decks',
      icon: FileChartColumn,
    },
    {
      label: 'Company Presentations',
      icon: PanelsTopLeft,
    },
    {
      label: 'Keynote Slides',
      icon: Monitor,
    },
    {
      label: 'Presentation Templates',
      icon: Frame,
    },
    {
      label: 'Data Visualization',
      icon: ChartNoAxesCombined,
    },
    {
      label: 'Reports',
      icon: FileText,
    },
  ],

  'print-design': [
    {
      label: 'Brochures',
      icon: FileText,
    },
    {
      label: 'Catalogs',
      icon: BookOpen,
    },
    {
      label: 'Business Cards',
      icon: Badge,
    },
    {
      label: 'Flyers',
      icon: FileImage,
    },
    {
      label: 'Posters',
      icon: Image,
    },
    {
      label: 'Editorial Layouts',
      icon: PanelsTopLeft,
    },
    {
      label: 'Event Materials',
      icon: Flag,
    },
    {
      label: 'Print Collateral',
      icon: Printer,
    },
  ],

  'web-design': [
    {
      label: 'Website Design',
      icon: AppWindow,
    },
    {
      label: 'Landing Pages',
      icon: MousePointerClick,
    },
    {
      label: 'Web Development',
      icon: Monitor,
    },
    {
      label: 'Ecommerce',
      icon: Store,
    },
    {
      label: 'Digital Experiences',
      icon: PanelsTopLeft,
    },
    {
      label: 'Interactive Features',
      icon: Sparkles,
    },
    {
      label: 'Design Systems',
      icon: LayoutDashboard,
    },
    {
      label: 'Website Redesigns',
      icon: Frame,
    },
  ],

  'mobile-app-design': [
    {
      label: 'Mobile Apps',
      icon: Smartphone,
    },
    {
      label: 'App Prototypes',
      icon: MousePointerClick,
    },
    {
      label: 'Product Interfaces',
      icon: LayoutDashboard,
    },
    {
      label: 'User Flows',
      icon: PanelsTopLeft,
    },
    {
      label: 'Mobile Design Systems',
      icon: Frame,
    },
    {
      label: 'App Redesigns',
      icon: Brush,
    },
    {
      label: 'Interactive Prototypes',
      icon: Smartphone,
    },
    {
      label: 'Product Dashboards',
      icon: ChartNoAxesCombined,
    },
  ],

  'campaign-strategy': [
    {
      label: 'Launch Campaigns',
      icon: Flag,
    },
    {
      label: 'Campaign Concepts',
      icon: Sparkles,
    },
    {
      label: 'Paid Media Creative',
      icon: Target,
    },
    {
      label: 'Digital Campaigns',
      icon: Monitor,
    },
    {
      label: 'Campaign Toolkits',
      icon: BriefcaseBusiness,
    },
    {
      label: 'Ad Creative',
      icon: Megaphone,
    },
    {
      label: 'Launch Assets',
      icon: Send,
    },
    {
      label: 'Campaign Systems',
      icon: Frame,
    },
  ],

  'social-media-creative': [
    {
      label: 'Social Posts',
      icon: Image,
    },
    {
      label: 'Story Graphics',
      icon: Smartphone,
    },
    {
      label: 'Social Templates',
      icon: PanelsTopLeft,
    },
    {
      label: 'Campaign Creative',
      icon: Megaphone,
    },
    {
      label: 'Paid Social Ads',
      icon: Target,
    },
    {
      label: 'Content Systems',
      icon: Frame,
    },
    {
      label: 'Motion Graphics',
      icon: Video,
    },
    {
      label: 'Launch Content',
      icon: Sparkles,
    },
  ],

  'email-design': [
    {
      label: 'Newsletters',
      icon: Mail,
    },
    {
      label: 'Email Campaigns',
      icon: Send,
    },
    {
      label: 'Welcome Emails',
      icon: Mail,
    },
    {
      label: 'Promotional Emails',
      icon: Megaphone,
    },
    {
      label: 'Email Templates',
      icon: PanelsTopLeft,
    },
    {
      label: 'Automated Flows',
      icon: Sparkles,
    },
    {
      label: 'Lifecycle Emails',
      icon: Mail,
    },
    {
      label: 'Launch Emails',
      icon: Flag,
    },
  ],
};

function ProductGroup({
  products,
}: {
  products: ProductItem[];
}) {
  return (
    <div
      className="
        flex
        shrink-0
        items-center
        gap-3
        pr-3
      "
    >
      {products.map(
        ({ label, icon: Icon }) => (
          <div
            key={label}
            className="
              flex
              h-14
              shrink-0
              items-center
              gap-3
              rounded-[14px]
              border
              border-white/[0.04]
              bg-white/[0.065]
              px-5
              text-white
              sm:h-16
              sm:px-6
            "
          >
            <Icon
              aria-hidden="true"
              className="
                h-[18px]
                w-[18px]
                shrink-0
                stroke-[1.8]
                text-white/75
              "
            />

            <span
              className="
                whitespace-nowrap
                text-[14px]
                font-medium
                tracking-[-0.015em]
                text-white/90
                sm:text-[15px]
              "
            >
              {label}
            </span>
          </div>
        )
      )}
    </div>
  );
}

export function ServiceProductStrip({
  service,
}: ServiceProductStripProps) {
  const products =
    serviceProducts[service.slug] ??
    serviceProducts[
    'branding-services'
    ];

  return (
    <div
      className="
        relative
        overflow-hidden
        bg-[#010008]
        pb-14
        text-white
        sm:pb-16
      "
    >
      {/* -------------------------------------------------------- */}
      {/* Heading                                                  */}
      {/* -------------------------------------------------------- */}

      <div
        className="
          container-page
          mb-5
        "
      >
      </div>

      {/* -------------------------------------------------------- */}
      {/* Edge fades                                               */}
      {/* -------------------------------------------------------- */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          bottom-0
          left-0
          top-0
          z-20
          w-12
          bg-gradient-to-r
          from-[#010008]
          to-transparent
          sm:w-24
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          bottom-0
          right-0
          top-0
          z-20
          w-12
          bg-gradient-to-l
          from-[#010008]
          to-transparent
          sm:w-24
        "
      />

      {/* -------------------------------------------------------- */}
      {/* Endless strip                                            */}
      {/* -------------------------------------------------------- */}

      <div
        className="
          service-product-strip
          flex
          w-max
          items-center
        "
      >
        <ProductGroup
          products={products}
        />

        <ProductGroup
          products={products}
        />
      </div>

      <style jsx global>{`
        @keyframes serviceProductMarquee {
          from {
            transform: translate3d(
              0,
              0,
              0
            );
          }

          to {
            transform: translate3d(
              -50%,
              0,
              0
            );
          }
        }

        .service-product-strip {
          animation: serviceProductMarquee
            38s linear infinite;
          will-change: transform;
        }

        @media (max-width: 768px) {
          .service-product-strip {
            animation-duration: 30s;
          }
        }

        @media (
          prefers-reduced-motion:
            reduce
        ) {
          .service-product-strip {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}