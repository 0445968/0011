import type { AssessmentDefinition } from './types';

// Brand Health Score — dimensional scoring across 7 brand health dimensions.
// Uses a 5-point agreement scale. Each question contributes to one dimension.

export const brandHealth: AssessmentDefinition = {
  id: 'brand-health',
  title: 'Brand Health Score',
  subtitle: 'Assess the strength and consistency of your brand',
  intro: 'This assessment evaluates your brand across seven key dimensions of brand health. Answer each statement honestly based on where your brand is today — not where you hope it will be. Your results will highlight strengths to build on and opportunities to prioritize. This is a practical strategic assessment, not a formal diagnostic.',
  scoringMode: 'dimensional',
  persistKey: 'studio-lab-assessment-brand-health',
  resultVariant: 'scorecard',
  resultNote: 'Your scores reflect your self-assessment at this moment in time. Use them as a strategic starting point for prioritizing improvements, not as a definitive measurement of brand value.',
  ctaText: 'Want help strengthening your brand\'s weakest dimensions?',
  ctaHref: '/contact',

  dimensions: [
    {
      id: 'strategy',
      label: 'Strategy',
      bands: [
        { threshold: 0, label: 'Needs attention' },
        { threshold: 40, label: 'Developing' },
        { threshold: 60, label: 'Solid foundation' },
        { threshold: 75, label: 'Strong' },
        { threshold: 90, label: 'Exceptional' },
      ],
      guidance: {
        low: 'Your brand strategy needs fundamental definition. Start by clarifying why your business exists beyond making money and what change it exists to create.',
        medium: 'You have a strategic foundation but it may not be fully articulated or consistently applied. Document your strategy and ensure your team understands it.',
        high: 'Your strategy is clear and well-communiced. Focus on maintaining alignment as you grow and evolve.',
      },
    },
    {
      id: 'audience',
      label: 'Audience Clarity',
      bands: [
        { threshold: 0, label: 'Needs attention' },
        { threshold: 40, label: 'Developing' },
        { threshold: 60, label: 'Solid foundation' },
        { threshold: 75, label: 'Strong' },
        { threshold: 90, label: 'Exceptional' },
      ],
      guidance: {
        low: 'Your audience definition is too broad or unclear. Go beyond demographics and define who specifically you serve, what they care about, and what problems they face.',
        medium: 'You know your audience generally but may not understand them deeply enough to anticipate needs. Invest in customer research and direct conversations.',
        high: 'You have a clear, well-understood audience. Continue refining your understanding as their needs and your market evolve.',
      },
    },
    {
      id: 'differentiation',
      label: 'Differentiation',
      bands: [
        { threshold: 0, label: 'Needs attention' },
        { threshold: 40, label: 'Developing' },
        { threshold: 60, label: 'Solid foundation' },
        { threshold: 75, label: 'Strong' },
        { threshold: 90, label: 'Exceptional' },
      ],
      guidance: {
        low: 'Clarify what your business uniquely owns in the market beyond quality, service, or price. Identify an advantage competitors cannot easily make the same claim about.',
        medium: 'You have some points of difference but they may not be clearly articulated or well-defended. Sharpen your differentiation and make it central to your messaging.',
        high: 'You have a clear, defensible point of difference. Protect it by continuing to invest in what makes you unique.',
      },
    },
    {
      id: 'messaging',
      label: 'Messaging',
      bands: [
        { threshold: 0, label: 'Needs attention' },
        { threshold: 40, label: 'Developing' },
        { threshold: 60, label: 'Solid foundation' },
        { threshold: 75, label: 'Strong' },
        { threshold: 90, label: 'Exceptional' },
      ],
      guidance: {
        low: 'Your messaging lacks clarity or consistency. Define your core messages — what you say, how you say it, and why it matters — and use them everywhere.',
        medium: 'You have messages but they may vary across channels or audiences. Create a simple message framework that everyone can use consistently.',
        high: 'Your messaging is clear and consistent. Keep it fresh and relevant as your brand and market evolve.',
      },
    },
    {
      id: 'visual',
      label: 'Visual Identity',
      bands: [
        { threshold: 0, label: 'Needs attention' },
        { threshold: 40, label: 'Developing' },
        { threshold: 60, label: 'Solid foundation' },
        { threshold: 75, label: 'Strong' },
        { threshold: 90, label: 'Exceptional' },
      ],
      guidance: {
        low: 'Your visual identity is inconsistent or unprofessional. Invest in foundational brand design — logo, colors, typography, and basic guidelines.',
        medium: 'You have visual elements but they may not be applied consistently. Create simple brand guidelines and ensure all touchpoints follow them.',
        high: 'Your visual identity is professional and consistent. Keep it current without changing for change\'s sake.',
      },
    },
    {
      id: 'consistency',
      label: 'Consistency',
      bands: [
        { threshold: 0, label: 'Needs attention' },
        { threshold: 40, label: 'Developing' },
        { threshold: 60, label: 'Solid foundation' },
        { threshold: 75, label: 'Strong' },
        { threshold: 90, label: 'Exceptional' },
      ],
      guidance: {
        low: 'Your brand experience varies significantly across touchpoints. Audit every customer touchpoint and align them to a consistent brand standard.',
        medium: 'You are generally consistent but have gaps. Identify the touchpoints that feel off-brand and bring them into alignment.',
        high: 'You deliver a consistent brand experience. Maintain this as you scale by documenting and training.',
      },
    },
    {
      id: 'experience',
      label: 'Customer Experience',
      bands: [
        { threshold: 0, label: 'Needs attention' },
        { threshold: 40, label: 'Developing' },
        { threshold: 60, label: 'Solid foundation' },
        { threshold: 75, label: 'Strong' },
        { threshold: 90, label: 'Exceptional' },
      ],
      guidance: {
        low: 'The customer experience does not yet reflect your brand intentionally. Map the customer journey and design each stage to deliver on your brand promise.',
        medium: 'You deliver a decent experience but it may not feel distinctly yours. Look for moments where you can inject more brand personality and intention.',
        high: 'You deliver an on-brand experience that customers notice. Keep refining the details that make it feel uniquely yours.',
      },
    },
  ],

  questions: [
    // Strategy (3)
    {
      id: 's1',
      text: 'We can clearly articulate why our business exists beyond making money.',
      options: [
        { id: 'sd', label: 'Strongly disagree', dimensionalWeights: { strategy: 0 } },
        { id: 'd', label: 'Disagree', dimensionalWeights: { strategy: 20 } },
        { id: 'sw', label: 'Somewhat', dimensionalWeights: { strategy: 40 } },
        { id: 'a', label: 'Agree', dimensionalWeights: { strategy: 70 } },
        { id: 'sa', label: 'Strongly agree', dimensionalWeights: { strategy: 100 } },
      ],
    },
    {
      id: 's2',
      text: 'Our brand strategy guides day-to-day decisions about what we do and don\'t do.',
      options: [
        { id: 'sd', label: 'Strongly disagree', dimensionalWeights: { strategy: 0 } },
        { id: 'd', label: 'Disagree', dimensionalWeights: { strategy: 20 } },
        { id: 'sw', label: 'Somewhat', dimensionalWeights: { strategy: 40 } },
        { id: 'a', label: 'Agree', dimensionalWeights: { strategy: 70 } },
        { id: 'sa', label: 'Strongly agree', dimensionalWeights: { strategy: 100 } },
      ],
    },
    {
      id: 's3',
      text: 'Our team understands and can explain our brand strategy in their own words.',
      options: [
        { id: 'sd', label: 'Strongly disagree', dimensionalWeights: { strategy: 0 } },
        { id: 'd', label: 'Disagree', dimensionalWeights: { strategy: 20 } },
        { id: 'sw', label: 'Somewhat', dimensionalWeights: { strategy: 40 } },
        { id: 'a', label: 'Agree', dimensionalWeights: { strategy: 70 } },
        { id: 'sa', label: 'Strongly agree', dimensionalWeights: { strategy: 100 } },
      ],
    },
    // Audience Clarity (3)
    {
      id: 'a1',
      text: 'We know exactly who our ideal customers are, beyond basic demographics.',
      options: [
        { id: 'sd', label: 'Strongly disagree', dimensionalWeights: { audience: 0 } },
        { id: 'd', label: 'Disagree', dimensionalWeights: { audience: 20 } },
        { id: 'sw', label: 'Somewhat', dimensionalWeights: { audience: 40 } },
        { id: 'a', label: 'Agree', dimensionalWeights: { audience: 70 } },
        { id: 'sa', label: 'Strongly agree', dimensionalWeights: { audience: 100 } },
      ],
    },
    {
      id: 'a2',
      text: 'We understand what our customers care about and what problems matter most to them.',
      options: [
        { id: 'sd', label: 'Strongly disagree', dimensionalWeights: { audience: 0 } },
        { id: 'd', label: 'Disagree', dimensionalWeights: { audience: 20 } },
        { id: 'sw', label: 'Somewhat', dimensionalWeights: { audience: 40 } },
        { id: 'a', label: 'Agree', dimensionalWeights: { audience: 70 } },
        { id: 'sa', label: 'Strongly agree', dimensionalWeights: { audience: 100 } },
      ],
    },
    {
      id: 'a3',
      text: 'We regularly talk to or research our customers to stay current with their needs.',
      options: [
        { id: 'sd', label: 'Strongly disagree', dimensionalWeights: { audience: 0 } },
        { id: 'd', label: 'Disagree', dimensionalWeights: { audience: 20 } },
        { id: 'sw', label: 'Somewhat', dimensionalWeights: { audience: 40 } },
        { id: 'a', label: 'Agree', dimensionalWeights: { audience: 70 } },
        { id: 'sa', label: 'Strongly agree', dimensionalWeights: { audience: 100 } },
      ],
    },
    // Differentiation (3)
    {
      id: 'd1',
      text: 'We can clearly explain why customers should choose us instead of alternatives.',
      options: [
        { id: 'sd', label: 'Strongly disagree', dimensionalWeights: { differentiation: 0 } },
        { id: 'd', label: 'Disagree', dimensionalWeights: { differentiation: 20 } },
        { id: 'sw', label: 'Somewhat', dimensionalWeights: { differentiation: 40 } },
        { id: 'a', label: 'Agree', dimensionalWeights: { differentiation: 70 } },
        { id: 'sa', label: 'Strongly agree', dimensionalWeights: { differentiation: 100 } },
      ],
    },
    {
      id: 'd2',
      text: 'Our competitors cannot easily make the same claims we make about what makes us different.',
      options: [
        { id: 'sd', label: 'Strongly disagree', dimensionalWeights: { differentiation: 0 } },
        { id: 'd', label: 'Disagree', dimensionalWeights: { differentiation: 20 } },
        { id: 'sw', label: 'Somewhat', dimensionalWeights: { differentiation: 40 } },
        { id: 'a', label: 'Agree', dimensionalWeights: { differentiation: 70 } },
        { id: 'sa', label: 'Strongly agree', dimensionalWeights: { differentiation: 100 } },
      ],
    },
    {
      id: 'd3',
      text: 'Customers can describe what makes us different without prompting.',
      options: [
        { id: 'sd', label: 'Strongly disagree', dimensionalWeights: { differentiation: 0 } },
        { id: 'd', label: 'Disagree', dimensionalWeights: { differentiation: 20 } },
        { id: 'sw', label: 'Somewhat', dimensionalWeights: { differentiation: 40 } },
        { id: 'a', label: 'Agree', dimensionalWeights: { differentiation: 70 } },
        { id: 'sa', label: 'Strongly agree', dimensionalWeights: { differentiation: 100 } },
      ],
    },
    // Messaging (3)
    {
      id: 'm1',
      text: 'We have a clear, consistent way of describing what we do and why it matters.',
      options: [
        { id: 'sd', label: 'Strongly disagree', dimensionalWeights: { messaging: 0 } },
        { id: 'd', label: 'Disagree', dimensionalWeights: { messaging: 20 } },
        { id: 'sw', label: 'Somewhat', dimensionalWeights: { messaging: 40 } },
        { id: 'a', label: 'Agree', dimensionalWeights: { messaging: 70 } },
        { id: 'sa', label: 'Strongly agree', dimensionalWeights: { messaging: 100 } },
      ],
    },
    {
      id: 'm2',
      text: 'Our messaging sounds consistent across our website, social media, sales conversations, and customer support.',
      options: [
        { id: 'sd', label: 'Strongly disagree', dimensionalWeights: { messaging: 0 } },
        { id: 'd', label: 'Disagree', dimensionalWeights: { messaging: 20 } },
        { id: 'sw', label: 'Somewhat', dimensionalWeights: { messaging: 40 } },
        { id: 'a', label: 'Agree', dimensionalWeights: { messaging: 70 } },
        { id: 'sa', label: 'Strongly agree', dimensionalWeights: { messaging: 100 } },
      ],
    },
    {
      id: 'm3',
      text: 'Our messaging focuses on what customers care about, not just what we want to say.',
      options: [
        { id: 'sd', label: 'Strongly disagree', dimensionalWeights: { messaging: 0 } },
        { id: 'd', label: 'Disagree', dimensionalWeights: { messaging: 20 } },
        { id: 'sw', label: 'Somewhat', dimensionalWeights: { messaging: 40 } },
        { id: 'a', label: 'Agree', dimensionalWeights: { messaging: 70 } },
        { id: 'sa', label: 'Strongly agree', dimensionalWeights: { messaging: 100 } },
      ],
    },
    // Visual Identity (3)
    {
      id: 'v1',
      text: 'Our visual identity (logo, colors, typography) looks professional and current.',
      options: [
        { id: 'sd', label: 'Strongly disagree', dimensionalWeights: { visual: 0 } },
        { id: 'd', label: 'Disagree', dimensionalWeights: { visual: 20 } },
        { id: 'sw', label: 'Somewhat', dimensionalWeights: { visual: 40 } },
        { id: 'a', label: 'Agree', dimensionalWeights: { visual: 70 } },
        { id: 'sa', label: 'Strongly agree', dimensionalWeights: { visual: 100 } },
      ],
    },
    {
      id: 'v2',
      text: 'Our visual identity is applied consistently across all touchpoints.',
      options: [
        { id: 'sd', label: 'Strongly disagree', dimensionalWeights: { visual: 0 } },
        { id: 'd', label: 'Disagree', dimensionalWeights: { visual: 20 } },
        { id: 'sw', label: 'Somewhat', dimensionalWeights: { visual: 40 } },
        { id: 'a', label: 'Agree', dimensionalWeights: { visual: 70 } },
        { id: 'sa', label: 'Strongly agree', dimensionalWeights: { visual: 100 } },
      ],
    },
    {
      id: 'v3',
      text: 'We have brand guidelines that our team can easily follow.',
      options: [
        { id: 'sd', label: 'Strongly disagree', dimensionalWeights: { visual: 0 } },
        { id: 'd', label: 'Disagree', dimensionalWeights: { visual: 20 } },
        { id: 'sw', label: 'Somewhat', dimensionalWeights: { visual: 40 } },
        { id: 'a', label: 'Agree', dimensionalWeights: { visual: 70 } },
        { id: 'sa', label: 'Strongly agree', dimensionalWeights: { visual: 100 } },
      ],
    },
    // Consistency (3)
    {
      id: 'c1',
      text: 'A customer would recognize our brand instantly across any touchpoint.',
      options: [
        { id: 'sd', label: 'Strongly disagree', dimensionalWeights: { consistency: 0 } },
        { id: 'd', label: 'Disagree', dimensionalWeights: { consistency: 20 } },
        { id: 'sw', label: 'Somewhat', dimensionalWeights: { consistency: 40 } },
        { id: 'a', label: 'Agree', dimensionalWeights: { consistency: 70 } },
        { id: 'sa', label: 'Strongly agree', dimensionalWeights: { consistency: 100 } },
      ],
    },
    {
      id: 'c2',
      text: 'Our brand feels the same whether someone visits our website, reads an email, or talks to our team.',
      options: [
        { id: 'sd', label: 'Strongly disagree', dimensionalWeights: { consistency: 0 } },
        { id: 'd', label: 'Disagree', dimensionalWeights: { consistency: 20 } },
        { id: 'sw', label: 'Somewhat', dimensionalWeights: { consistency: 40 } },
        { id: 'a', label: 'Agree', dimensionalWeights: { consistency: 70 } },
        { id: 'sa', label: 'Strongly agree', dimensionalWeights: { consistency: 100 } },
      ],
    },
    {
      id: 'c3',
      text: 'Our tone of voice is consistent across all written and spoken communication.',
      options: [
        { id: 'sd', label: 'Strongly disagree', dimensionalWeights: { consistency: 0 } },
        { id: 'd', label: 'Disagree', dimensionalWeights: { consistency: 20 } },
        { id: 'sw', label: 'Somewhat', dimensionalWeights: { consistency: 40 } },
        { id: 'a', label: 'Agree', dimensionalWeights: { consistency: 70 } },
        { id: 'sa', label: 'Strongly agree', dimensionalWeights: { consistency: 100 } },
      ],
    },
    // Customer Experience (3)
    {
      id: 'e1',
      text: 'Every interaction with our brand reflects who we are and what we stand for.',
      options: [
        { id: 'sd', label: 'Strongly disagree', dimensionalWeights: { experience: 0 } },
        { id: 'd', label: 'Disagree', dimensionalWeights: { experience: 20 } },
        { id: 'sw', label: 'Somewhat', dimensionalWeights: { experience: 40 } },
        { id: 'a', label: 'Agree', dimensionalWeights: { experience: 70 } },
        { id: 'sa', label: 'Strongly agree', dimensionalWeights: { experience: 100 } },
      ],
    },
    {
      id: 'e2',
      text: 'We have intentionally designed the customer journey to reflect our brand at every stage.',
      options: [
        { id: 'sd', label: 'Strongly disagree', dimensionalWeights: { experience: 0 } },
        { id: 'd', label: 'Disagree', dimensionalWeights: { experience: 20 } },
        { id: 'sw', label: 'Somewhat', dimensionalWeights: { experience: 40 } },
        { id: 'a', label: 'Agree', dimensionalWeights: { experience: 70 } },
        { id: 'sa', label: 'Strongly agree', dimensionalWeights: { experience: 100 } },
      ],
    },
    {
      id: 'e3',
      text: 'Customers tell us that doing business with us feels distinctively different from our competitors.',
      options: [
        { id: 'sd', label: 'Strongly disagree', dimensionalWeights: { experience: 0 } },
        { id: 'd', label: 'Disagree', dimensionalWeights: { experience: 20 } },
        { id: 'sw', label: 'Somewhat', dimensionalWeights: { experience: 40 } },
        { id: 'a', label: 'Agree', dimensionalWeights: { experience: 70 } },
        { id: 'sa', label: 'Strongly agree', dimensionalWeights: { experience: 100 } },
      ],
    },
  ],
};
