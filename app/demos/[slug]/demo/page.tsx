import {
    notFound,
  } from 'next/navigation';
  
  import type {
    Metadata,
  } from 'next';
  
  import {
    demos,
    getDemoBySlug,
  } from '@/data/demos/registry';
  
  import {
    DemoRunner,
  } from '@/components/demos/shared/DemoRunner';
  
  export function generateStaticParams() {
    return demos
      .filter(
        (demo) =>
          demo.status !==
          'planned'
      )
      .map(
        (demo) => ({
          slug:
            demo.slug,
        })
      );
  }
  
  export async function generateMetadata({
    params,
  }: {
    params: {
      slug: string;
    };
  }): Promise<Metadata> {
    const demo =
      getDemoBySlug(
        params.slug
      );
  
    if (
      !demo ||
      demo.status ===
        'planned'
    ) {
      return {
        title:
          'Demo not found',
      };
    }
  
    return {
      title: `${demo.productName} — Demo`,
  
      description:
        demo.shortDescription,
  
      robots: {
        index:
          false,
        follow:
          false,
      },
    };
  }
  
  export default function InteractiveDemoPage({
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
      demo.status ===
        'planned'
    ) {
      notFound();
    }
  
    return (
      <DemoRunner
        demo={demo}
      />
    );
  }