import { Hero } from '@/components/portfolio/Hero';
import { About } from '@/components/portfolio/About';
import { Services } from '@/components/portfolio/Services';
import { Projects } from '@/components/portfolio/Projects';
import { ResourceLibraryPreview } from '@/components/portfolio/ResourceLibraryPreview';
import { CaseStudy } from '@/components/portfolio/CaseStudy';
import { FeaturedCaseStudies } from '@/components/portfolio/FeaturedCaseStudies'
import { ServicesMarquee } from '@/components/portfolio/ServicesMarquee';

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <ServicesCarousel />
      <Services />
      <FeaturedCaseStudies />
      <ResourceLibraryPreview />
    </>
  );
}
