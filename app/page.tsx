import { Hero } from '@/components/portfolio/Hero';
import { About } from '@/components/home/About';
import { IntegrationsPromo} from '@/components/home/IntegrationsPromo';
import { Projects } from '@/components/portfolio/Projects';
import { Differences } from '@/components/portfolio/differences/Differences';
import { ResourceLibraryPreview } from '@/components/portfolio/resources/ResourceLibraryPreview';
import { ExploreHub } from '@/components/home/ExploreHub';
import { CaseStudy } from '@/components/portfolio/CaseStudy';
import { FeaturedCaseStudies } from '@/components/portfolio/FeaturedCaseStudies'
import { ServicesCarousel } from '@/components/portfolio/services/ServicesCarousel';
import { BrandStrategyProblem } from '@/components/services/strategy-problem/BrandStrategyProblem';


export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <BrandStrategyProblem />
      <IntegrationsPromo />
      <ServicesCarousel />
      <Differences />
      <FeaturedCaseStudies />
      <ResourceLibraryPreview />
    </>
  );
}
