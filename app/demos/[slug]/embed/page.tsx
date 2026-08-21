import {
    notFound,
  } from 'next/navigation';
  
  import {
    demos,
    getDemoBySlug,
  } from '@/data/demos/registry';
  
  import {
    getDemoComponent,
  } from '@/components/demos';
  
  export function generateStaticParams() {
    return demos.map((demo) => ({
      slug: demo.slug,
    }));
  }
  
  export default function DemoEmbedPage({
    params,
  }: {
    params: {
      slug: string;
    };
  }) {
    const demo =
      getDemoBySlug(
        params.slug
      );
  
    if (
      !demo ||
      demo.status !== 'active'
    ) {
      notFound();
    }
  
    const DemoComponent =
      getDemoComponent(
        demo.slug
      );
  
    if (!DemoComponent) {
      notFound();
    }
  
    return (
      <div
        className="
          min-h-screen
          w-full
          overflow-x-hidden
        "
      >
        <DemoComponent
          slug={
            demo.slug
          }
        />
      </div>
    );
  }