import type { AssessmentDefinition } from './types';

// Brand Positioning Clarity — dimensional scoring across 7 positioning dimensions.
// Evaluates how clearly a business understands and communicates its market position.

export const brandPositioning: AssessmentDefinition = {
  id: 'brand-positioning',
  title: 'Brand Positioning Clarity',
  subtitle: 'Evaluate how clearly your brand is positioned',
  intro: 'This assessment helps you understand how clearly your brand is positioned in the market. Clear positioning means your audience, category, value, and differentiation are all well-defined and consistently communicated. This is a practical strategic tool, not a formal diagnostic — your results offer directional guidance for sharpening your positioning.',
  scoringMode: 'dimensional',
  persistKey: 'studio-lab-assessment-brand-positioning',
  resultVariant: 'scorecard',
  resultNote: 'Your positioning clarity scores reflect your current self-assessment. Use the weakest dimensions as a starting point for strategic conversations, not as a definitive verdict on your brand.',
  ctaText: 'Want help turning these insights into a sharper positioning strategy?',
  ctaHref: '/contact',

  dimensions: [
    {
      id: 'audience',
      label: 'Audience',
      bands: [
        { threshold: 0, label: 'Unclear' },
        { threshold: 30, label: 'Emerging' },
        { threshold: 50, label: 'Defined' },
        { threshold: 75, label: 'Distinct' },
        { threshold: 90, label: 'Highly Focused' },
      ],
      guidance: {
        low: 'Narrow the audience definition beyond broad demographic categories. Define who specifically you serve and what makes them the right fit.',
        medium: 'You have a general audience definition but it may be too broad. Consider which segments you serve best and prioritize them.',
        high: 'Your audience is sharply defined. Ensure all messaging and experience decisions flow from this clarity.',
      },
    },
    {
      id: 'category',
      label: 'Category',
      bands: [
        { threshold: 0, label: 'Unclear' },
        { threshold: 30, label: 'Emerging' },
        { threshold: 50, label: 'Defined' },
        { threshold: 75, label: 'Distinct' },
        { threshold: 90, label: 'Highly Focused' },
      ],
      guidance: {
        low: 'Clarify what category or space you compete in. If customers can\'t categorize you, they can\'t compare you or understand when to choose you.',
        medium: 'Your category is somewhat clear but may not be consistently communicated. Make sure everyone describes your category the same way.',
        high: 'Your category is well-defined and understood. Consider whether you need to redefine it as your market evolves.',
      },
    },
    {
      id: 'problem',
      label: 'Problem',
      bands: [
        { threshold: 0, label: 'Unclear' },
        { threshold: 30, label: 'Emerging' },
        { threshold: 50, label: 'Defined' },
        { threshold: 75, label: 'Distinct' },
        { threshold: 90, label: 'Highly Focused' },
      ],
      guidance: {
        low: 'Articulate the specific problem you solve in terms your customers would use. Not what you do — what problem it solves.',
        medium: 'You understand the problem but may not communicate it consistently. Lead with the problem in your messaging.',
        high: 'Your problem definition is clear and customer-aligned. Keep validating it as customer needs evolve.',
      },
    },
    {
      id: 'value',
      label: 'Value Proposition',
      bands: [
        { threshold: 0, label: 'Unclear' },
        { threshold: 30, label: 'Emerging' },
        { threshold: 50, label: 'Defined' },
        { threshold: 75, label: 'Distinct' },
        { threshold: 90, label: 'Highly Focused' },
      ],
      guidance: {
        low: 'Define your value proposition in one clear sentence: what you do, for whom, and what outcome they get.',
        medium: 'You have a value proposition but it may be too generic. Make it specific enough that competitors couldn\'t say the same thing.',
        high: 'Your value proposition is clear and differentiated. Keep it central to all communication.',
      },
    },
    {
      id: 'differentiation',
      label: 'Differentiation',
      bands: [
        { threshold: 0, label: 'Unclear' },
        { threshold: 30, label: 'Emerging' },
        { threshold: 50, label: 'Defined' },
        { threshold: 75, label: 'Distinct' },
        { threshold: 90, label: 'Highly Focused' },
      ],
      guidance: {
        low: 'Identify an advantage competitors cannot easily make the same claim about. Quality, service, and price are not differentiators.',
        medium: 'You have some differentiation but it may not be clearly articulated. Sharpen and defend your unique advantage.',
        high: 'Your differentiation is clear and defensible. Continue investing in what makes you genuinely different.',
      },
    },
    {
      id: 'relevance',
      label: 'Relevance',
      bands: [
        { threshold: 0, label: 'Unclear' },
        { threshold: 30, label: 'Emerging' },
        { threshold: 50, label: 'Defined' },
        { threshold: 75, label: 'Distinct' },
        { threshold: 90, label: 'Highly Focused' },
      ],
      guidance: {
        low: 'Ensure your positioning addresses something your audience actively cares about. Relevance is about timing and need, not just capability.',
        medium: 'You are relevant to your audience but may not be top-of-mind. Strengthen the connection between their priorities and your positioning.',
        high: 'Your positioning is highly relevant to your audience\'s current needs. Stay attuned to shifts in what matters to them.',
      },
    },
    {
      id: 'credibility',
      label: 'Credibility',
      bands: [
        { threshold: 0, label: 'Unclear' },
        { threshold: 30, label: 'Emerging' },
        { threshold: 50, label: 'Defined' },
        { threshold: 75, label: 'Distinct' },
        { threshold: 90, label: 'Highly Focused' },
      ],
      guidance: {
        low: 'Support positioning claims with proof, process, expertise, results, or customer evidence. Claims without proof feel like marketing.',
        medium: 'You have some credibility markers but may not use them consistently. Make proof visible in your messaging.',
        high: 'Your credibility is well-established and visible. Keep building evidence as you grow.',
      },
    },
  ],

  questions: [
    // Audience (2)
    {
      id: 'au1',
      text: 'We can describe our ideal customer in specific terms beyond broad demographics like age or industry.',
      options: agreementScale('audience'),
    },
    {
      id: 'au2',
      text: 'When we describe who we serve, other people immediately understand who we mean.',
      options: agreementScale('audience'),
    },
    // Category (2)
    {
      id: 'ca1',
      text: 'We know exactly what category or space we compete in and can name it clearly.',
      options: agreementScale('category'),
    },
    {
      id: 'ca2',
      text: 'Customers consistently categorize us the way we intend them to.',
      options: agreementScale('category'),
    },
    // Problem (2)
    {
      id: 'pr1',
      text: 'We can articulate the specific problem we solve in language our customers would use.',
      options: agreementScale('problem'),
    },
    {
      id: 'pr2',
      text: 'Our customers would describe the problem we solve the same way we do.',
      options: agreementScale('problem'),
    },
    // Value Proposition (2)
    {
      id: 'va1',
      text: 'We can state our value proposition in one clear sentence that anyone can understand.',
      options: agreementScale('value'),
    },
    {
      id: 'va2',
      text: 'Our value proposition focuses on the outcome customers get, not just the features we offer.',
      options: agreementScale('value'),
    },
    // Differentiation (2)
    {
      id: 'di1',
      text: 'We can explain why a customer should choose us over any specific competitor.',
      options: agreementScale('differentiation'),
    },
    {
      id: 'di2',
      text: 'Our competitors cannot easily make the same claims we make about what makes us different.',
      options: agreementScale('differentiation'),
    },
    // Relevance (2)
    {
      id: 're1',
      text: 'Our positioning addresses something our target audience actively cares about right now.',
      options: agreementScale('relevance'),
    },
    {
      id: 're2',
      text: 'Our positioning feels timely and connected to current trends or needs in our market.',
      options: agreementScale('relevance'),
    },
    // Credibility (2)
    {
      id: 'cr1',
      text: 'We can back up our positioning claims with specific proof, results, or evidence.',
      options: agreementScale('credibility'),
    },
    {
      id: 'cr2',
      text: 'Our website, proposals, and sales conversations consistently include proof points that support our positioning.',
      options: agreementScale('credibility'),
    },
    // Cross-cutting (1)
    {
      id: 'cc1',
      text: 'Our positioning actively guides decisions about what we pursue and what we decline.',
      options: [
        { id: 'sd', label: 'Strongly disagree', dimensionalWeights: { audience: 0, category: 0, problem: 0, value: 0, differentiation: 0, relevance: 0, credibility: 0 } },
        { id: 'd', label: 'Disagree', dimensionalWeights: { audience: 7, category: 7, problem: 7, value: 7, differentiation: 7, relevance: 7, credibility: 7 } },
        { id: 'sw', label: 'Somewhat', dimensionalWeights: { audience: 14, category: 14, problem: 14, value: 14, differentiation: 14, relevance: 14, credibility: 14 } },
        { id: 'a', label: 'Agree', dimensionalWeights: { audience: 24, category: 24, problem: 24, value: 24, differentiation: 24, relevance: 24, credibility: 24 } },
        { id: 'sa', label: 'Strongly agree', dimensionalWeights: { audience: 33, category: 33, problem: 33, value: 33, differentiation: 33, relevance: 33, credibility: 33 } },
      ],
    },
  ],
};

// Helper: standard 5-point agreement scale for a single dimension
function agreementScale(dimId: string) {
  return [
    { id: 'sd', label: 'Strongly disagree', dimensionalWeights: { [dimId]: 0 } },
    { id: 'd', label: 'Disagree', dimensionalWeights: { [dimId]: 25 } },
    { id: 'sw', label: 'Somewhat', dimensionalWeights: { [dimId]: 50 } },
    { id: 'a', label: 'Agree', dimensionalWeights: { [dimId]: 75 } },
    { id: 'sa', label: 'Strongly agree', dimensionalWeights: { [dimId]: 100 } },
  ];
}
