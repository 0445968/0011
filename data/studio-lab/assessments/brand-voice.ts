import type { AssessmentDefinition } from './types';

// Brand Voice Assessment — spectrum scoring across 6 voice dimensions.
// Produces a spectrum profile plus practical writing guidance.

export const brandVoice: AssessmentDefinition = {
  id: 'brand-voice',
  title: 'Brand Voice Assessment',
  subtitle: 'Define your brand\'s communication style',
  intro: 'Your brand voice is how you sound across every touchpoint — from website copy to customer support. This assessment helps you identify the voice characteristics that best fit your brand\'s personality and audience. There are no right or wrong answers — each dimension is a spectrum. This is a directional tool for guiding communication decisions, not a definitive prescription.',
  scoringMode: 'spectrum',
  persistKey: 'studio-lab-assessment-brand-voice',
  resultVariant: 'spectrum',
  resultNote: 'These results are directional guidance for shaping your brand voice. Use them alongside your brand personality and audience understanding to make communication decisions. Voice evolves with practice and feedback.',
  ctaText: 'Want help turning these voice characteristics into writing guidelines your team can use?',
  ctaHref: '/contact',

  spectra: [
    {
      id: 'professional-conversational',
      lowLabel: 'Professional',
      highLabel: 'Conversational',
      highImplications: [
        'Write like you\'re talking to one person, not addressing a crowd.',
        'Use contractions, questions, and direct address ("you", "we").',
        'Sample headline: "Let\'s figure this out together."',
      ],
      lowImplications: [
        'Use precise, polished language with clear structure.',
        'Avoid contractions in formal contexts. Lead with expertise.',
        'Sample headline: "Strategic solutions for complex challenges."',
      ],
    },
    {
      id: 'reserved-expressive',
      lowLabel: 'Reserved',
      highLabel: 'Expressive',
      highImplications: [
        'Use vivid, sensory language. Show personality and emotion.',
        'Sample CTA: "Jump in and see what happens."',
      ],
      lowImplications: [
        'Let facts and clarity lead. Minimal adjectives, maximal substance.',
        'Sample CTA: "Start your free trial."',
      ],
    },
    {
      id: 'serious-playful',
      lowLabel: 'Serious',
      highLabel: 'Playful',
      highImplications: [
        'Use humor, wit, and a lighter tone where appropriate.',
        'Sample social caption: "We could be serious, but where\'s the fun in that? 😄"',
      ],
      lowImplications: [
        'Prioritize clarity and credibility. Keep tone measured and professional.',
        'Sample social caption: "New analysis on industry trends — key takeaways inside."',
      ],
    },
    {
      id: 'technical-simple',
      lowLabel: 'Technical',
      highLabel: 'Simple',
      highImplications: [
        'Explain things so a smart non-expert can follow. Avoid jargon.',
        'Sample headline: "Make better decisions without the jargon."',
      ],
      lowImplications: [
        'Use precise terminology. Assume audience expertise.',
        'Sample headline: "Optimize your CI/CD pipeline with semantic versioning."',
      ],
    },
    {
      id: 'traditional-progressive',
      lowLabel: 'Traditional',
      highLabel: 'Progressive',
      highImplications: [
        'Use contemporary, forward-looking language. Challenge conventions.',
        'Sample headline: "The old way isn\'t going to cut it anymore."',
      ],
      lowImplications: [
        'Use established, timeless language. Emphasize reliability and heritage.',
        'Sample headline: "Trusted by leaders for over twenty years."',
      ],
    },
    {
      id: 'calm-energetic',
      lowLabel: 'Calm',
      highLabel: 'Energetic',
      highImplications: [
        'Use punchy, active language. Create momentum and urgency.',
        'Sample CTA: "Let\'s go! Start now."',
      ],
      lowImplications: [
        'Use measured, reassuring language. Create confidence and ease.',
        'Sample CTA: "Take your time. Start when you\'re ready."',
      ],
    },
  ],

  questions: [
    {
      id: 'q01',
      text: 'How should your brand sound when explaining something complex?',
      options: [
        { id: 'a', label: 'Like a knowledgeable friend breaking it down simply', spectrumWeights: { 'professional-conversational': 3, 'technical-simple': 3 } },
        { id: 'b', label: 'Like an expert speaking precisely to peers', spectrumWeights: { 'professional-conversational': -3, 'technical-simple': -3 } },
        { id: 'c', label: 'Like a passionate storyteller making it vivid', spectrumWeights: { 'reserved-expressive': 3, 'serious-playful': 1, 'calm-energetic': 2 } },
        { id: 'd', label: 'Like a calm guide walking you through step by step', spectrumWeights: { 'calm-energetic': -3, 'reserved-expressive': -1, 'professional-conversational': 1 } },
      ],
    },
    {
      id: 'q02',
      text: 'When writing a call-to-action, what should it feel like?',
      options: [
        { id: 'a', label: 'An exciting invitation to jump in', spectrumWeights: { 'calm-energetic': 3, 'reserved-expressive': 2, 'serious-playful': 2 } },
        { id: 'b', label: 'A clear, professional next step', spectrumWeights: { 'calm-energetic': -2, 'reserved-expressive': -2, 'professional-conversational': -1 } },
        { id: 'c', label: 'A warm, low-pressure encouragement', spectrumWeights: { 'calm-energetic': -3, 'professional-conversational': 2, 'reserved-expressive': -1 } },
        { id: 'd', label: 'A bold challenge to act now', spectrumWeights: { 'calm-energetic': 3, 'reserved-expressive': 2, 'traditional-progressive': 2 } },
      ],
    },
    {
      id: 'q03',
      text: 'How much humor should your brand use?',
      options: [
        { id: 'a', label: 'Frequently — it\'s part of who we are', spectrumWeights: { 'serious-playful': 3, 'reserved-expressive': 2, 'calm-energetic': 1 } },
        { id: 'b', label: 'Occasionally, when it fits naturally', spectrumWeights: { 'serious-playful': 1, 'reserved-expressive': 1 } },
        { id: 'c', label: 'Rarely — we need to be taken seriously', spectrumWeights: { 'serious-playful': -3, 'reserved-expressive': -2, 'professional-conversational': -1 } },
        { id: 'd', label: 'Never — humor undermines our credibility', spectrumWeights: { 'serious-playful': -3, 'professional-conversational': -2, 'reserved-expressive': -2 } },
      ],
    },
    {
      id: 'q04',
      text: 'When a customer is confused, how should your support communication sound?',
      options: [
        { id: 'a', label: 'Warm, patient, and reassuring', spectrumWeights: { 'professional-conversational': 2, 'calm-energetic': -2, 'reserved-expressive': -1 } },
        { id: 'b', label: 'Clear, efficient, and solution-focused', spectrumWeights: { 'professional-conversational': -1, 'calm-energetic': -1, 'reserved-expressive': -2 } },
        { id: 'c', label: 'Friendly and a bit playful to lighten the mood', spectrumWeights: { 'serious-playful': 3, 'professional-conversational': 2, 'calm-energetic': 1 } },
        { id: 'd', label: 'Authoritative and expert, so they trust the answer', spectrumWeights: { 'professional-conversational': -3, 'technical-simple': -2, 'reserved-expressive': -1 } },
      ],
    },
    {
      id: 'q05',
      text: 'What kind of vocabulary should your brand use?',
      options: [
        { id: 'a', label: 'Everyday words anyone can understand', spectrumWeights: { 'technical-simple': 3, 'professional-conversational': 2 } },
        { id: 'b', label: 'Industry-standard terminology for our field', spectrumWeights: { 'technical-simple': -3, 'professional-conversational': -2 } },
        { id: 'c', label: 'Rich, evocative language that paints pictures', spectrumWeights: { 'reserved-expressive': 3, 'technical-simple': 1, 'serious-playful': 1 } },
        { id: 'd', label: 'Precise, formal language that signals expertise', spectrumWeights: { 'professional-conversational': -3, 'reserved-expressive': -2, 'technical-simple': -1 } },
      ],
    },
    {
      id: 'q06',
      text: 'How should your brand write social media captions?',
      options: [
        { id: 'a', label: 'Punchy, fun, and full of personality', spectrumWeights: { 'serious-playful': 3, 'calm-energetic': 3, 'reserved-expressive': 2, 'professional-conversational': 2 } },
        { id: 'b', label: 'Thoughtful, measured, and insight-driven', spectrumWeights: { 'calm-energetic': -2, 'serious-playful': -2, 'professional-conversational': -1 } },
        { id: 'c', label: 'Bold, opinionated, and not afraid to ruffle feathers', spectrumWeights: { 'traditional-progressive': 3, 'reserved-expressive': 2, 'calm-energetic': 2, 'serious-playful': 1 } },
        { id: 'd', label: 'Helpful, practical, and straightforward', spectrumWeights: { 'reserved-expressive': -1, 'serious-playful': -1, 'professional-conversational': 1, 'calm-energetic': -1 } },
      ],
    },
    {
      id: 'q07',
      text: 'When announcing something new, what should the tone be?',
      options: [
        { id: 'a', label: 'Excited and energetic — this is a big deal', spectrumWeights: { 'calm-energetic': 3, 'reserved-expressive': 2, 'traditional-progressive': 2 } },
        { id: 'b', label: 'Calm and confident — the work speaks for itself', spectrumWeights: { 'calm-energetic': -3, 'reserved-expressive': -2, 'professional-conversational': -1 } },
        { id: 'c', label: 'Warm and inviting — come check this out', spectrumWeights: { 'professional-conversational': 2, 'calm-energetic': 1, 'reserved-expressive': 1 } },
        { id: 'd', label: 'Professional and informative — here are the facts', spectrumWeights: { 'professional-conversational': -2, 'reserved-expressive': -2, 'calm-energetic': -1 } },
      ],
    },
    {
      id: 'q08',
      text: 'How should your brand handle disagreement or pushback in writing?',
      options: [
        { id: 'a', label: 'With warmth and openness to other perspectives', spectrumWeights: { 'professional-conversational': 2, 'calm-energetic': -1, 'reserved-expressive': -1 } },
        { id: 'b', label: 'With confidence and clear reasoning', spectrumWeights: { 'professional-conversational': -1, 'reserved-expressive': -1, 'calm-energetic': -1 } },
        { id: 'c', label: 'With wit and a touch of provocation', spectrumWeights: { 'serious-playful': 3, 'calm-energetic': 2, 'traditional-progressive': 2, 'reserved-expressive': 2 } },
        { id: 'd', label: 'With careful, measured responses', spectrumWeights: { 'calm-energetic': -3, 'reserved-expressive': -2, 'serious-playful': -2 } },
      ],
    },
    {
      id: 'q09',
      text: 'What should your brand\'s sentence structure feel like?',
      options: [
        { id: 'a', label: 'Short, punchy, and varied in rhythm', spectrumWeights: { 'calm-energetic': 2, 'reserved-expressive': 1, 'serious-playful': 1 } },
        { id: 'b', label: 'Longer, flowing, and richly descriptive', spectrumWeights: { 'reserved-expressive': 3, 'traditional-progressive': -1 } },
        { id: 'c', label: 'Clean, structured, and easy to scan', spectrumWeights: { 'reserved-expressive': -2, 'technical-simple': 2, 'professional-conversational': -1 } },
        { id: 'd', label: 'Formal, complete, and grammatically precise', spectrumWeights: { 'professional-conversational': -3, 'reserved-expressive': -1, 'technical-simple': -1 } },
      ],
    },
    {
      id: 'q10',
      text: 'How should your brand address the reader?',
      options: [
        { id: 'a', label: 'Directly and personally, like a one-on-one conversation', spectrumWeights: { 'professional-conversational': 3, 'reserved-expressive': 1, 'calm-energetic': 1 } },
        { id: 'b', label: 'Professionally, addressing them as a client or professional', spectrumWeights: { 'professional-conversational': -3, 'reserved-expressive': -1, 'calm-energetic': -1 } },
        { id: 'c', label: 'Playfully, as if they\'re already a friend', spectrumWeights: { 'serious-playful': 3, 'professional-conversational': 2, 'calm-energetic': 2 } },
        { id: 'd', label: 'Respectfully but with warmth', spectrumWeights: { 'professional-conversational': 1, 'serious-playful': -1, 'calm-energetic': -1 } },
      ],
    },
    {
      id: 'q11',
      text: 'When writing about your product or service, what should lead?',
      options: [
        { id: 'a', label: 'The story and the feeling it creates', spectrumWeights: { 'reserved-expressive': 3, 'serious-playful': 1, 'traditional-progressive': 1 } },
        { id: 'b', label: 'The features and how they work', spectrumWeights: { 'technical-simple': -3, 'reserved-expressive': -2, 'professional-conversational': -1 } },
        { id: 'c', label: 'The benefit in plain, simple terms', spectrumWeights: { 'technical-simple': 3, 'reserved-expressive': -1, 'professional-conversational': 1 } },
        { id: 'd', label: 'The proof and the expertise behind it', spectrumWeights: { 'professional-conversational': -2, 'technical-simple': -2, 'reserved-expressive': -1 } },
      ],
    },
    {
      id: 'q12',
      text: 'How should your brand feel about conventions and trends in language?',
      options: [
        { id: 'a', label: 'We follow established conventions — clarity over cleverness', spectrumWeights: { 'traditional-progressive': -3, 'serious-playful': -1, 'calm-energetic': -1 } },
        { id: 'b', label: 'We break conventions when it serves the message', spectrumWeights: { 'traditional-progressive': 3, 'reserved-expressive': 2, 'serious-playful': 1 } },
        { id: 'c', label: 'We use current, contemporary language naturally', spectrumWeights: { 'traditional-progressive': 2, 'professional-conversational': 1, 'calm-energetic': 1 } },
        { id: 'd', label: 'We stick to timeless, proven phrasing', spectrumWeights: { 'traditional-progressive': -3, 'reserved-expressive': -1, 'calm-energetic': -1 } },
      ],
    },
  ],
};
