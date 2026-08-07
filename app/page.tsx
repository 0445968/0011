import { Hero } from '@/components/portfolio/Hero';
import { About } from '@/components/portfolio/About';
import { Projects } from '@/components/portfolio/Projects';
import { ResourceLibraryPreview } from '@/components/portfolio/resources/ResourceLibraryPreview';
import { CaseStudy } from '@/components/portfolio/CaseStudy';
import { FeaturedCaseStudies } from '@/components/portfolio/FeaturedCaseStudies'
import { ServicesCarousel } from '@/components/portfolio/services/ServicesCarousel';


export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <ServicesCarousel />
      <FeaturedCaseStudies />
      <ResourceLibraryPreview />
    </>
  );
}
