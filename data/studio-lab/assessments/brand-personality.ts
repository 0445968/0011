import type { AssessmentDefinition } from './types';

// Brand Personality Builder — spectrum scoring across 6 personality dimensions.
// Questions use scenario-based answers that contribute weights toward opposing traits.

export const brandPersonality: AssessmentDefinition = {
  id: 'brand-personality',
  title: 'Brand Personality Builder',
  subtitle: 'Discover your brand\'s personality profile',
  intro: 'Explore how your brand communicates, looks, and feels across six personality dimensions. There are no right or wrong answers — each dimension represents a spectrum, and your brand can sit anywhere along it. This is a directional tool for strategic exploration, not a validated diagnostic.',
  scoringMode: 'spectrum',
  persistKey: 'studio-lab-assessment-brand-personality',
  resultVariant: 'spectrum',
  resultNote: 'These results are directional guidance for brand strategy exploration, not a validated psychological assessment. Use them as a starting point for conversations about how your brand should feel and communicate.',
  ctaText: 'Want help turning these personality insights into a cohesive brand identity?',
  ctaHref: '/contact',

  spectra: [
    {
      id: 'bold-reserved',
      lowLabel: 'Reserved',
      highLabel: 'Bold',
      highImplications: [
        'Messaging: Make strong, confident claims. Take a clear stance.',
        'Design: Use high contrast, large type, and assertive layouts.',
        'Social: Lead with opinions and hot takes. Don\'t be afraid to challenge convention.',
      ],
      lowImplications: [
        'Messaging: Let evidence and subtlety make the case. Avoid hype.',
        'Design: Use refined, understated typography and generous whitespace.',
        'Social: Share insights and observations rather than declarations.',
      ],
    },
    {
      id: 'playful-serious',
      lowLabel: 'Serious',
      highLabel: 'Playful',
      highImplications: [
        'Messaging: Use humor, wordplay, and a lighter tone where appropriate.',
        'Design: Use vibrant colors, rounded forms, and expressive illustrations.',
        'Social: Have fun. Memes, behind-the-scenes, and personality-driven content work well.',
      ],
      lowImplications: [
        'Messaging: Prioritize clarity, precision, and professionalism.',
        'Design: Use clean grids, neutral palettes, and structured layouts.',
        'Social: Focus on insights, data, and thought leadership.',
      ],
    },
    {
      id: 'premium-accessible',
      lowLabel: 'Accessible',
      highLabel: 'Premium',
      highImplications: [
        'Messaging: Emphasize craftsmanship, exclusivity, and attention to detail.',
        'Design: Use refined typography, restrained palettes, and luxurious materials.',
        'Experience: Personal touches, white-glove service, and thoughtful details matter.',
      ],
      lowImplications: [
        'Messaging: Emphasize value, ease, and approachability.',
        'Design: Use friendly, clear design that welcomes everyone.',
        'Experience: Make things simple, fast, and frictionless.',
      ],
    },
    {
      id: 'modern-traditional',
      lowLabel: 'Traditional',
      highLabel: 'Modern',
      highImplications: [
        'Messaging: Use contemporary language. Reference what\'s next, not what\'s been.',
        'Design: Use current design trends, experimental layouts, and digital-first thinking.',
        'Social: Be early to new platforms and formats.',
      ],
      lowImplications: [
        'Messaging: Use timeless, established language. Emphasize heritage and longevity.',
        'Design: Use classic typography, established conventions, and enduring aesthetics.',
        'Social: Be reliable and consistent rather than chasing trends.',
      ],
    },
    {
      id: 'expressive-minimal',
      lowLabel: 'Minimal',
      highLabel: 'Expressive',
      highImplications: [
        'Messaging: Use rich, evocative language. Tell stories and paint pictures.',
        'Design: Use bold imagery, animation, and multi-sensory experiences.',
        'Social: Show personality through every touchpoint. More is more.',
      ],
      lowImplications: [
        'Messaging: Say less. Let clarity and brevity do the work.',
        'Design: Strip away decoration. Function and whitespace lead.',
        'Social: Communicate through quality, not quantity of expression.',
      ],
    },
    {
      id: 'warm-authoritative',
      lowLabel: 'Authoritative',
      highLabel: 'Warm',
      highImplications: [
        'Messaging: Use conversational, friendly language. Build rapport before making points.',
        'Design: Use soft colors, organic shapes, and human imagery.',
        'Experience: Make customers feel known and cared for personally.',
      ],
      lowImplications: [
        'Messaging: Use confident, expert language. Lead with credibility.',
        'Design: Use structured, formal design that signals expertise.',
        'Experience: Make customers feel they\'re in capable, professional hands.',
      ],
    },
  ],

  questions: [
    {
      id: 'q01',
      text: 'When your brand enters a conversation in your industry, what should it feel like?',
      options: [
        { id: 'a', label: 'A confident voice that challenges the status quo', spectrumWeights: { 'bold-reserved': 3, 'modern-traditional': 2, 'expressive-minimal': 2 } },
        { id: 'b', label: 'A thoughtful observer adding nuance and depth', spectrumWeights: { 'bold-reserved': -2, 'warm-authoritative': 1, 'playful-serious': -2 } },
        { id: 'c', label: 'A friendly presence that makes people feel welcome', spectrumWeights: { 'warm-authoritative': 3, 'playful-serious': 2, 'premium-accessible': -2 } },
        { id: 'd', label: 'An expert sharing authoritative insights', spectrumWeights: { 'warm-authoritative': -3, 'playful-serious': -2, 'premium-accessible': 2 } },
      ],
    },
    {
      id: 'q02',
      text: 'A customer just had their first interaction with your brand. What should they walk away feeling?',
      options: [
        { id: 'a', label: 'Impressed by the polish and attention to detail', spectrumWeights: { 'premium-accessible': 3, 'expressive-minimal': 1, 'playful-serious': -1 } },
        { id: 'b', label: 'Excited by something fresh and unexpected', spectrumWeights: { 'modern-traditional': 3, 'bold-reserved': 2, 'expressive-minimal': 2 } },
        { id: 'c', label: 'Comfortable, like they\'re in good hands', spectrumWeights: { 'warm-authoritative': 3, 'playful-serious': 1, 'premium-accessible': -1 } },
        { id: 'd', label: 'Confident in the expertise behind the brand', spectrumWeights: { 'warm-authoritative': -2, 'playful-serious': -2, 'premium-accessible': 1 } },
      ],
    },
    {
      id: 'q03',
      text: 'What kind of language should your brand use in its communications?',
      options: [
        { id: 'a', label: 'Rich, evocative, and full of personality', spectrumWeights: { 'expressive-minimal': 3, 'warm-authoritative': 2, 'playful-serious': 1 } },
        { id: 'b', label: 'Clean, precise, and to the point', spectrumWeights: { 'expressive-minimal': -3, 'playful-serious': -1, 'warm-authoritative': -1 } },
        { id: 'c', label: 'Bold, direct, and not afraid to take a stance', spectrumWeights: { 'bold-reserved': 3, 'expressive-minimal': 1, 'modern-traditional': 1 } },
        { id: 'd', label: 'Refined, considered, and quietly confident', spectrumWeights: { 'premium-accessible': 2, 'bold-reserved': -2, 'expressive-minimal': -1 } },
      ],
    },
    {
      id: 'q04',
      text: 'How should your brand approach visual design?',
      options: [
        { id: 'a', label: 'Push boundaries with bold layouts and experimental ideas', spectrumWeights: { 'bold-reserved': 2, 'modern-traditional': 3, 'expressive-minimal': 3 } },
        { id: 'b', label: 'Use timeless principles with meticulous craftsmanship', spectrumWeights: { 'modern-traditional': -2, 'premium-accessible': 3, 'expressive-minimal': -2 } },
        { id: 'c', label: 'Keep it simple, functional, and stripped of decoration', spectrumWeights: { 'expressive-minimal': -3, 'playful-serious': -1, 'premium-accessible': -1 } },
        { id: 'd', label: 'Use warmth, personality, and human-centered visuals', spectrumWeights: { 'warm-authoritative': 3, 'playful-serious': 2, 'expressive-minimal': 1 } },
      ],
    },
    {
      id: 'q05',
      text: 'When a competitor makes a big splash, how should your brand respond?',
      options: [
        { id: 'a', label: 'Make an even bigger statement that redefines the conversation', spectrumWeights: { 'bold-reserved': 3, 'expressive-minimal': 2, 'modern-traditional': 2 } },
        { id: 'b', label: 'Quietly deliver better work and let quality speak', spectrumWeights: { 'bold-reserved': -3, 'premium-accessible': 2, 'expressive-minimal': -2 } },
        { id: 'c', label: 'Respond with warmth and focus on customer relationships', spectrumWeights: { 'warm-authoritative': 3, 'bold-reserved': -1, 'playful-serious': 1 } },
        { id: 'd', label: 'Provide a thoughtful, expert counterpoint', spectrumWeights: { 'warm-authoritative': -2, 'playful-serious': -2, 'bold-reserved': -1 } },
      ],
    },
    {
      id: 'q06',
      text: 'What should your brand\'s social media presence feel like?',
      options: [
        { id: 'a', label: 'Entertaining, playful, and full of personality', spectrumWeights: { 'playful-serious': 3, 'expressive-minimal': 2, 'warm-authoritative': 2 } },
        { id: 'b', label: 'Authoritative, sharing expertise and industry leadership', spectrumWeights: { 'playful-serious': -3, 'warm-authoritative': -2, 'premium-accessible': 1 } },
        { id: 'c', label: 'Minimal but striking — less posts, more impact', spectrumWeights: { 'expressive-minimal': -2, 'bold-reserved': 2, 'premium-accessible': 2 } },
        { id: 'd', label: 'Experimental, trying new formats before anyone else', spectrumWeights: { 'modern-traditional': 3, 'expressive-minimal': 2, 'playful-serious': 1 } },
      ],
    },
    {
      id: 'q07',
      text: 'How formal should your brand be with customers?',
      options: [
        { id: 'a', label: 'Conversational and relaxed, like talking to a friend', spectrumWeights: { 'warm-authoritative': 3, 'playful-serious': 2, 'premium-accessible': -2 } },
        { id: 'b', label: 'Polished and professional, but not stiff', spectrumWeights: { 'warm-authoritative': -1, 'playful-serious': -1, 'premium-accessible': 2 } },
        { id: 'c', label: 'Highly formal and distinguished', spectrumWeights: { 'warm-authoritative': -3, 'playful-serious': -3, 'premium-accessible': 3 } },
        { id: 'd', label: 'Confident and direct, skipping pleasantries', spectrumWeights: { 'bold-reserved': 2, 'expressive-minimal': 1, 'warm-authoritative': -2 } },
      ],
    },
    {
      id: 'q08',
      text: 'How much should your brand experiment with new approaches?',
      options: [
        { id: 'a', label: 'Constantly. Innovation is part of our identity', spectrumWeights: { 'modern-traditional': 3, 'bold-reserved': 2, 'expressive-minimal': 2 } },
        { id: 'b', label: 'Selectively, only when it clearly improves things', spectrumWeights: { 'modern-traditional': -1, 'premium-accessible': 2, 'expressive-minimal': -1 } },
        { id: 'c', label: 'Rarely. We value proven approaches and consistency', spectrumWeights: { 'modern-traditional': -3, 'expressive-minimal': -2, 'playful-serious': -1 } },
        { id: 'd', label: 'We experiment in tone and content, not in strategy', spectrumWeights: { 'expressive-minimal': 2, 'playful-serious': 2, 'bold-reserved': 1 } },
      ],
    },
    {
      id: 'q09',
      text: 'What kind of imagery should represent your brand?',
      options: [
        { id: 'a', label: 'Bold, dramatic, and impossible to miss', spectrumWeights: { 'bold-reserved': 3, 'expressive-minimal': 3, 'modern-traditional': 1 } },
        { id: 'b', label: 'Clean, minimal, and carefully composed', spectrumWeights: { 'expressive-minimal': -3, 'premium-accessible': 2, 'playful-serious': -1 } },
        { id: 'c', label: 'Warm, human, and full of personality', spectrumWeights: { 'warm-authoritative': 3, 'playful-serious': 2, 'expressive-minimal': 1 } },
        { id: 'd', label: 'Classic, refined, and timeless', spectrumWeights: { 'modern-traditional': -2, 'premium-accessible': 3, 'expressive-minimal': -1 } },
      ],
    },
    {
      id: 'q10',
      text: 'How should your brand handle mistakes or criticism publicly?',
      options: [
        { id: 'a', label: 'With humility, humor, and genuine warmth', spectrumWeights: { 'warm-authoritative': 3, 'playful-serious': 2, 'bold-reserved': -1 } },
        { id: 'b', label: 'With a clear, direct statement and a plan', spectrumWeights: { 'bold-reserved': 1, 'warm-authoritative': -1, 'playful-serious': -2 } },
        { id: 'c', label: 'Quietly fix it and let actions speak', spectrumWeights: { 'expressive-minimal': -2, 'bold-reserved': -2, 'warm-authoritative': -1 } },
        { id: 'd', label: 'With confidence and a perspective that reframes the issue', spectrumWeights: { 'bold-reserved': 3, 'expressive-minimal': 2, 'modern-traditional': 1 } },
      ],
    },
    {
      id: 'q11',
      text: 'What should pricing and positioning signal about your brand?',
      options: [
        { id: 'a', label: 'Premium quality that justifies a higher price', spectrumWeights: { 'premium-accessible': 3, 'playful-serious': -1, 'bold-reserved': 1 } },
        { id: 'b', label: 'Great value that\'s accessible to many', spectrumWeights: { 'premium-accessible': -3, 'warm-authoritative': 2, 'playful-serious': 1 } },
        { id: 'c', label: 'Worth it because of the expertise behind it', spectrumWeights: { 'warm-authoritative': -2, 'premium-accessible': 1, 'playful-serious': -2 } },
        { id: 'd', label: 'An investment in something better', spectrumWeights: { 'premium-accessible': 2, 'modern-traditional': 1, 'expressive-minimal': 1 } },
      ],
    },
    {
      id: 'q12',
      text: 'When customers describe your brand to a friend, what should they say?',
      options: [
        { id: 'a', label: 'They\'re so innovative and ahead of the curve', spectrumWeights: { 'modern-traditional': 3, 'bold-reserved': 2, 'expressive-minimal': 1 } },
        { id: 'b', label: 'They\'re so warm and genuinely care about you', spectrumWeights: { 'warm-authoritative': 3, 'playful-serious': 1, 'premium-accessible': -1 } },
        { id: 'c', label: 'They\'re the absolute best at what they do', spectrumWeights: { 'warm-authoritative': -2, 'premium-accessible': 2, 'playful-serious': -2 } },
        { id: 'd', label: 'They just make things simple and clear', spectrumWeights: { 'expressive-minimal': -2, 'warm-authoritative': 1, 'premium-accessible': -1 } },
      ],
    },
    {
      id: 'q13',
      text: 'How should your brand approach content and storytelling?',
      options: [
        { id: 'a', label: 'Big, bold narratives that challenge how people think', spectrumWeights: { 'bold-reserved': 3, 'expressive-minimal': 2, 'modern-traditional': 2 } },
        { id: 'b', label: 'Beautiful, crafted stories with attention to every detail', spectrumWeights: { 'premium-accessible': 3, 'expressive-minimal': 1, 'bold-reserved': -1 } },
        { id: 'c', label: 'Fun, engaging content that people actually enjoy', spectrumWeights: { 'playful-serious': 3, 'warm-authoritative': 2, 'expressive-minimal': 2 } },
        { id: 'd', label: 'Useful, practical content that helps people get things done', spectrumWeights: { 'expressive-minimal': -2, 'playful-serious': -2, 'warm-authoritative': 1 } },
      ],
    },
    {
      id: 'q14',
      text: 'What does your brand\'s relationship with tradition look like?',
      options: [
        { id: 'a', label: 'We honor it but aren\'t bound by it', spectrumWeights: { 'modern-traditional': 1, 'premium-accessible': 1, 'bold-reserved': 1 } },
        { id: 'b', label: 'We actively reject it in favor of new approaches', spectrumWeights: { 'modern-traditional': 3, 'bold-reserved': 2, 'expressive-minimal': 2 } },
        { id: 'c', label: 'We draw strength from it and build on established foundations', spectrumWeights: { 'modern-traditional': -3, 'premium-accessible': 2, 'warm-authoritative': -1 } },
        { id: 'd', label: 'Tradition isn\'t really relevant to what we do', spectrumWeights: { 'modern-traditional': 1, 'expressive-minimal': 1, 'playful-serious': 1 } },
      ],
    },
    {
      id: 'q15',
      text: 'How should your brand make people feel during a customer support interaction?',
      options: [
        { id: 'a', label: 'Cared for and personally valued', spectrumWeights: { 'warm-authoritative': 3, 'playful-serious': 1, 'premium-accessible': 1 } },
        { id: 'b', label: 'Confident that experts are solving the problem', spectrumWeights: { 'warm-authoritative': -2, 'playful-serious': -2, 'premium-accessible': 2 } },
        { id: 'c', label: 'Delighted by a surprisingly human and fun experience', spectrumWeights: { 'playful-serious': 3, 'warm-authoritative': 2, 'expressive-minimal': 2 } },
        { id: 'd', label: 'Impressed by the speed and efficiency', spectrumWeights: { 'expressive-minimal': -2, 'bold-reserved': 1, 'premium-accessible': 1 } },
      ],
    },
  ],
};
