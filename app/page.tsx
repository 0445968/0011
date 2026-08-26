import { Hero } from '@/components/portfolio/Hero';
import { AboutCustomers } from '@/components/home/about/AboutCustomers';
import { AboutFeature } from '@/components/home/about/AboutFeature';
import { IntegrationsPromo} from '@/components/home/IntegrationsPromo';
import { Projects } from '@/components/portfolio/Projects';
import { Differences } from '@/components/portfolio/differences/Differences';
import { ResourceLibraryPreview } from '@/components/portfolio/resources/ResourceLibraryPreview';
import { ExploreHub } from '@/components/home/ExploreHub';
import { CaseStudy } from '@/components/portfolio/CaseStudy';
import { FeaturedCaseStudies } from '@/components/portfolio/FeaturedCaseStudies'
import { ServicesCarousel } from '@/components/portfolio/services/ServicesCarousel';
import { BrandStrategyProblem } from '@/components/services/strategy-problem/BrandStrategyProblem';
import { BrandNextSection } from '@/components/home/BrandNextSection';


export default function Home() {
  return (
    <>
      <Hero />
      <AboutCustomers />
      <BrandStrategyProblem />
      <BrandNextSection />
      <ServicesCarousel />
      <Differences />
      <FeaturedCaseStudies />
      <ResourceLibraryPreview />
      <IntegrationsPromo />
    </>
  );
}
