import { blogCategories } from './categories';

import { whyGoodBusinessesBecomeHardToExplain } from './posts/why-good-businesses-become-hard-to-explain';
import { theHiddenCostOfOfferingTooManyServices } from './posts/the-hidden-cost-of-offering-too-many-services';
import { whatClientsAreActuallyPayingYouFor } from './posts/what-clients-are-actually-paying-you-for';
import { whenGrowthStartsDilutingTheBusiness } from './posts/when-growth-starts-diluting-the-business';
import { youProbablyDontNeedAnotherRevenueStream } from './posts/you-probably-dont-need-another-revenue-stream';
import { smallBusinessesDontNeedToLookSmall } from './posts/small-businesses-dont-need-to-look-small';

import { positioningIsNotATagline } from './posts/positioning-is-not-a-tagline';
import { yourCompetitionIsBiggerThanYourCategory } from './posts/your-competition-is-bigger-than-your-category';
import { whyDifferentiationUsuallyGetsWateredDown } from './posts/why-differentiation-usually-gets-watered-down';
import { aBrandStrategyShouldHelpYouSayNo } from './posts/a-brand-strategy-should-help-you-say-no';
import { whenConsistencyStartsBecomingPredictable } from './posts/when-consistency-starts-becoming-predictable';
import { theProblemWithTryingToAppealToEveryone } from './posts/the-problem-with-trying-to-appeal-to-everyone';

import { whyExpensiveDesignOftenLooksSimple } from './posts/why-expensive-design-often-looks-simple';
import { goodDesignDoesntNeedToExplainItself } from './posts/good-design-doesnt-need-to-explain-itself';
import { theCaseForDesigningLess } from './posts/the-case-for-designing-less';
import { whySomeWebsitesFeelBetterBeforeYouKnowWhy } from './posts/why-some-websites-feel-better-before-you-know-why';
import { typographyIsDoingMoreWorkThanYouThink } from './posts/typography-is-doing-more-work-than-you-think';
import { theDifferenceBetweenDecorationAndDirection } from './posts/the-difference-between-decoration-and-direction';

import { attentionIsNotTheSameAsDemand } from './posts/attention-is-not-the-same-as-demand';
import { whyMoreContentIsntAlwaysBetterMarketing } from './posts/why-more-content-isnt-always-better-marketing';
import { yourHomepageIsNotYourEntireSalesPitch } from './posts/your-homepage-is-not-your-entire-sales-pitch';
import { theProblemWithCopyingYourCompetitorsContent } from './posts/the-problem-with-copying-your-competitors-content';
import { marketingGetsEasierWhenTheOfferGetsClearer } from './posts/marketing-gets-easier-when-the-offer-gets-clearer';
import { notEveryCustomerNeedsToBecomeAnAudience } from './posts/not-every-customer-needs-to-become-an-audience';

import { whyCreativeWorkGetsWorseWithTooMuchFeedback } from './posts/why-creative-work-gets-worse-with-too-much-feedback';
import { theMostValuablePartOfACreativeProcessIsOftenInvisible } from './posts/the-most-valuable-part-of-a-creative-process-is-often-invisible';
import { tasteIsABusinessAdvantage } from './posts/taste-is-a-business-advantage';
import { whenFasterWorkProducesSlowerResults } from './posts/when-faster-work-produces-slower-results';
import { whyConstraintsUsuallyImproveCreativeWork } from './posts/why-constraints-usually-improve-creative-work';
import { theDifferenceBetweenMakingSomethingGoodAndMakingSomethingUseful } from './posts/the-difference-between-making-something-good-and-making-something-useful';

export type {
  BlogBlock,
  BlogPost,
} from './types';

export {
  blogCategories,
};

export const blogPosts = [
  whyGoodBusinessesBecomeHardToExplain,
  theHiddenCostOfOfferingTooManyServices,
  whatClientsAreActuallyPayingYouFor,
  whenGrowthStartsDilutingTheBusiness,
  youProbablyDontNeedAnotherRevenueStream,
  smallBusinessesDontNeedToLookSmall,

  positioningIsNotATagline,
  yourCompetitionIsBiggerThanYourCategory,
  whyDifferentiationUsuallyGetsWateredDown,
  aBrandStrategyShouldHelpYouSayNo,
  whenConsistencyStartsBecomingPredictable,
  theProblemWithTryingToAppealToEveryone,

  whyExpensiveDesignOftenLooksSimple,
  goodDesignDoesntNeedToExplainItself,
  theCaseForDesigningLess,
  whySomeWebsitesFeelBetterBeforeYouKnowWhy,
  typographyIsDoingMoreWorkThanYouThink,
  theDifferenceBetweenDecorationAndDirection,

  attentionIsNotTheSameAsDemand,
  whyMoreContentIsntAlwaysBetterMarketing,
  yourHomepageIsNotYourEntireSalesPitch,
  theProblemWithCopyingYourCompetitorsContent,
  marketingGetsEasierWhenTheOfferGetsClearer,
  notEveryCustomerNeedsToBecomeAnAudience,

  whyCreativeWorkGetsWorseWithTooMuchFeedback,
  theMostValuablePartOfACreativeProcessIsOftenInvisible,
  tasteIsABusinessAdvantage,
  whenFasterWorkProducesSlowerResults,
  whyConstraintsUsuallyImproveCreativeWork,
  theDifferenceBetweenMakingSomethingGoodAndMakingSomethingUseful,
];

export function getPostBySlug(slug: string) {
  return blogPosts.find(
    (post) => post.slug === slug
  );
}