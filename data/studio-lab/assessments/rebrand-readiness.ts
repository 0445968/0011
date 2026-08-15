import type { AssessmentDefinition } from './types';

// Rebrand Readiness Assessment — categorical scoring with 5 readiness outcomes.
// Uses weighted scoring where major strategic triggers carry more weight than
// cosmetic preferences. Some answer patterns should produce "Maintain" or "Refine",
// not always recommending a rebrand.

const ACCENT = {
  maintain: '#10b981',
  refine: '#3b82f6',
  refresh: '#f59e0b',
  evolve: '#8b5cf6',
  rebrand: '#ef4444',
};

export const rebrandReadiness: AssessmentDefinition = {
  id: 'rebrand-readiness',
  title: 'Rebrand Readiness Assessment',
  subtitle: 'Evaluate whether your business is ready for a rebrand',
  intro: 'This assessment helps you understand whether your current brand needs a light touch, a strategic evolution, or a full rebrand. It focuses on business circumstances — strategic shifts, audience changes, market positioning — rather than simply whether your logo feels dated. Answer based on your current reality, not your aspirations. This is a directional starting point, not a substitute for professional strategic analysis.',
  scoringMode: 'categorical',
  persistKey: 'studio-lab-assessment-rebrand-readiness',
  resultVariant: 'readiness',
  resultNote: 'These results are directional guidance based on your self-assessment. A rebrand is a significant strategic decision that should involve professional analysis, stakeholder input, and careful planning. Use these results to frame conversations, not to make final decisions.',
  ctaText: 'Considering a rebrand? We can help you think through the strategic implications.',
  ctaHref: '/contact',

  categories: [
    {
      id: 'maintain',
      label: 'Maintain',
      accent: ACCENT.maintain,
      description: 'Your brand is well-aligned with your business. No major rebrand is currently indicated. Continue investing in consistency and incremental improvement.',
      recommendation: 'Focus on brand consistency, refining execution, and deepening what\'s already working. A formal rebrand is not needed at this time.',
      strengths: ['Your brand accurately reflects who you are', 'Your audience recognizes and trusts your brand', 'Your positioning is clear and relevant'],
      pitfalls: ['Even strong brands need periodic refreshes to stay current', 'Don\'t let consistency become stagnation'],
    },
    {
      id: 'refine',
      label: 'Refine',
      accent: ACCENT.refine,
      description: 'Your brand is fundamentally sound but could benefit from targeted improvements. Strategic refinement — not a full rebrand — may be sufficient.',
      recommendation: 'Identify the specific areas that feel weak or inconsistent and invest in targeted improvements. You don\'t need to start over — you need to sharpen what exists.',
      strengths: ['Your core brand foundation is solid', 'Targeted fixes can address the gaps', 'Lower risk and cost than a full rebrand'],
    },
    {
      id: 'refresh',
      label: 'Refresh',
      accent: ACCENT.refresh,
      description: 'Your brand\'s strategy is sound but its visual identity or messaging feels outdated. A brand refresh — modernizing the expression without changing the essence — is appropriate.',
      recommendation: 'Update your visual identity and messaging to feel current and confident. Keep your strategic positioning intact while modernizing how it looks and sounds.',
      strengths: ['Your strategy doesn\'t need to change', 'A visual refresh can re-energize your brand', 'Moderate investment with meaningful impact'],
    },
    {
      id: 'evolve',
      label: 'Evolve',
      accent: ACCENT.evolve,
      description: 'Your brand has fallen behind your business reality. Meaningful strategic and visual evolution is recommended to realign your brand with where your business is going.',
      recommendation: 'Engage in a strategic brand evolution that revisits positioning, messaging, and visual identity together. Your brand needs to catch up to your business.',
      strengths: ['An opportunity to realign brand with business', 'Stakeholders likely see the need for change', 'Evolution preserves equity while moving forward'],
    },
    {
      id: 'rebrand',
      label: 'Rebrand',
      accent: ACCENT.rebrand,
      description: 'A comprehensive strategic rebrand may be justified. Your business has changed significantly and your current brand no longer serves where you\'re going.',
      recommendation: 'Consider a full strategic rebrand that redefines positioning, identity, messaging, and experience from the ground up. This is a significant investment that should align with a clear strategic vision.',
      strengths: ['A fresh start can unlock new markets and audiences', 'Removes accumulated inconsistencies and confusion', 'Signals a meaningful shift to the market'],
    },
  ],

  questions: [
    {
      id: 'q01',
      text: 'How well does your current brand reflect what your business actually does today?',
      options: [
        { id: 'a', label: 'Perfectly — it accurately represents who we are', categoricalWeights: { maintain: 5, refine: 1 } },
        { id: 'b', label: 'Mostly — minor gaps between brand and reality', categoricalWeights: { refine: 4, maintain: 1 } },
        { id: 'c', label: 'Partially — noticeable gaps in what we do vs. what we say', categoricalWeights: { refresh: 3, evolve: 2 } },
        { id: 'd', label: 'Poorly — our brand describes a business we\'ve outgrown', categoricalWeights: { evolve: 3, rebrand: 4 } },
        { id: 'e', label: 'Not at all — our brand is for a completely different business', categoricalWeights: { rebrand: 6 } },
      ],
    },
    {
      id: 'q02',
      text: 'Has your target audience changed significantly in the last 2–3 years?',
      options: [
        { id: 'a', label: 'No — we serve the same audience', categoricalWeights: { maintain: 4, refine: 1 } },
        { id: 'b', label: 'Slightly — expanded to adjacent audiences', categoricalWeights: { refine: 3, refresh: 1 } },
        { id: 'c', label: 'Moderately — serving new types of customers', categoricalWeights: { evolve: 3, refresh: 2 } },
        { id: 'd', label: 'Significantly — fundamentally different audience now', categoricalWeights: { rebrand: 5, evolve: 2 } },
      ],
    },
    {
      id: 'q03',
      text: 'How consistent is your brand across all touchpoints?',
      options: [
        { id: 'a', label: 'Very consistent — everything looks and feels unified', categoricalWeights: { maintain: 4, refine: 1 } },
        { id: 'b', label: 'Mostly consistent with a few rough edges', categoricalWeights: { refine: 4, refresh: 1 } },
        { id: 'c', label: 'Inconsistent — different teams and channels look different', categoricalWeights: { refresh: 3, evolve: 2 } },
        { id: 'd', label: 'Very inconsistent — no one would know it\'s the same brand', categoricalWeights: { evolve: 3, rebrand: 3 } },
      ],
    },
    {
      id: 'q04',
      text: 'Have you significantly changed your business model, products, or services?',
      options: [
        { id: 'a', label: 'No — same business model and offerings', categoricalWeights: { maintain: 4, refine: 1 } },
        { id: 'b', label: 'Minor additions or adjustments', categoricalWeights: { refine: 3, refresh: 1 } },
        { id: 'c', label: 'Significant new offerings or model changes', categoricalWeights: { evolve: 4, refresh: 2 } },
        { id: 'd', label: 'Fundamental transformation of what we sell', categoricalWeights: { rebrand: 6 } },
      ],
    },
    {
      id: 'q05',
      text: 'How do customers describe your brand compared to how you intend to be seen?',
      options: [
        { id: 'a', label: 'They describe us the way we intend', categoricalWeights: { maintain: 5, refine: 1 } },
        { id: 'b', label: 'Close — minor misunderstandings', categoricalWeights: { refine: 4, refresh: 1 } },
        { id: 'c', label: 'Often off — they see us differently than we see ourselves', categoricalWeights: { evolve: 3, refresh: 2 } },
        { id: 'd', label: 'Completely different — our reputation doesn\'t match our reality', categoricalWeights: { rebrand: 5, evolve: 2 } },
      ],
    },
    {
      id: 'q06',
      text: 'Has your company gone through a merger, acquisition, or major restructuring?',
      options: [
        { id: 'a', label: 'No', categoricalWeights: { maintain: 4, refine: 2 } },
        { id: 'b', label: 'Yes, minor — absorbed a small team or product', categoricalWeights: { refine: 3, refresh: 2 } },
        { id: 'c', label: 'Yes, significant — merged with another organization', categoricalWeights: { evolve: 3, rebrand: 3 } },
        { id: 'd', label: 'Yes, major — fundamentally changed the company structure', categoricalWeights: { rebrand: 6 } },
      ],
    },
    {
      id: 'q07',
      text: 'How easy is it for competitors to look like they do what you do?',
      options: [
        { id: 'a', label: 'Very hard — we have a clear, defensible position', categoricalWeights: { maintain: 4, refine: 1 } },
        { id: 'b', label: 'Somewhat hard — we have some differentiation', categoricalWeights: { refine: 3, refresh: 1 } },
        { id: 'c', label: 'Somewhat easy — we blend in more than we\'d like', categoricalWeights: { refresh: 2, evolve: 3 } },
        { id: 'd', label: 'Very easy — we look like everyone else', categoricalWeights: { evolve: 3, rebrand: 4 } },
      ],
    },
    {
      id: 'q08',
      text: 'How do your team members describe your company when asked?',
      options: [
        { id: 'a', label: 'Consistently — everyone tells the same story', categoricalWeights: { maintain: 5, refine: 1 } },
        { id: 'b', label: 'Mostly consistent with minor variations', categoricalWeights: { refine: 4, refresh: 1 } },
        { id: 'c', label: 'Inconsistent — different people say different things', categoricalWeights: { evolve: 3, refresh: 2 } },
        { id: 'd', label: 'Wildly different — no shared understanding of who we are', categoricalWeights: { rebrand: 5, evolve: 2 } },
      ],
    },
    {
      id: 'q09',
      text: 'How old is your current visual identity (logo, colors, core design)?',
      options: [
        { id: 'a', label: 'Less than 2 years', categoricalWeights: { maintain: 5, refine: 2 } },
        { id: 'b', label: '2–5 years', categoricalWeights: { maintain: 2, refine: 3, refresh: 1 } },
        { id: 'c', label: '5–10 years', categoricalWeights: { refresh: 3, refine: 2, evolve: 1 } },
        { id: 'd', label: 'More than 10 years', categoricalWeights: { refresh: 2, evolve: 3, rebrand: 2 } },
      ],
    },
    {
      id: 'q10',
      text: 'Are you entering new markets or geographic regions?',
      options: [
        { id: 'a', label: 'No — same market and region', categoricalWeights: { maintain: 4, refine: 1 } },
        { id: 'b', label: 'Expanding within our current market', categoricalWeights: { refine: 3, refresh: 1 } },
        { id: 'c', label: 'Entering new but related markets', categoricalWeights: { evolve: 3, refresh: 2 } },
        { id: 'd', label: 'Entering fundamentally different markets', categoricalWeights: { rebrand: 4, evolve: 2 } },
      ],
    },
    {
      id: 'q11',
      text: 'What\'s driving the conversation about rebranding in your organization?',
      options: [
        { id: 'a', label: 'Nothing — we\'re not really discussing it', categoricalWeights: { maintain: 5, refine: 2 } },
        { id: 'b', label: 'Occasional comments about looking more current', categoricalWeights: { refresh: 4, refine: 2 } },
        { id: 'c', label: 'Strategic discussions about alignment with business direction', categoricalWeights: { evolve: 4, refresh: 1 } },
        { id: 'd', label: 'Leadership mandate driven by fundamental business change', categoricalWeights: { rebrand: 5, evolve: 2 } },
        { id: 'e', label: 'I\'m personally tired of our logo', categoricalWeights: { maintain: 2, refine: 2, refresh: 1 } },
      ],
    },
    {
      id: 'q12',
      text: 'Has your pricing or market position changed significantly?',
      options: [
        { id: 'a', label: 'No — same pricing and position', categoricalWeights: { maintain: 4, refine: 1 } },
        { id: 'b', label: 'Minor adjustments', categoricalWeights: { refine: 3, refresh: 1 } },
        { id: 'c', label: 'Significant shift (e.g., premium to value or vice versa)', categoricalWeights: { evolve: 4, refresh: 2 } },
        { id: 'd', label: 'Fundamental repositioning', categoricalWeights: { rebrand: 5, evolve: 2 } },
      ],
    },
    {
      id: 'q13',
      text: 'How do your customers react to your current brand?',
      options: [
        { id: 'a', label: 'Positively — they recognize and trust it', categoricalWeights: { maintain: 5, refine: 1 } },
        { id: 'b', label: 'Neutral — they don\'t have strong feelings', categoricalWeights: { refine: 3, refresh: 2 } },
        { id: 'c', label: 'Confused — they\'re not sure what we do', categoricalWeights: { evolve: 3, refresh: 2 } },
        { id: 'd', label: 'Negative or outdated — it feels old or irrelevant', categoricalWeights: { rebrand: 4, evolve: 2 } },
      ],
    },
    {
      id: 'q14',
      text: 'Has your company culture or internal identity shifted significantly?',
      options: [
        { id: 'a', label: 'No — same culture and identity', categoricalWeights: { maintain: 4, refine: 1 } },
        { id: 'b', label: 'Slightly — natural evolution over time', categoricalWeights: { refine: 3, refresh: 1 } },
        { id: 'c', label: 'Significantly — we feel like a different organization', categoricalWeights: { evolve: 4, refresh: 1 } },
        { id: 'd', label: 'Fundamentally — total transformation', categoricalWeights: { rebrand: 4, evolve: 2 } },
      ],
    },
    {
      id: 'q15',
      text: 'Are your competitors rebranding or significantly evolving?',
      options: [
        { id: 'a', label: 'No — the market is stable', categoricalWeights: { maintain: 3, refine: 2 } },
        { id: 'b', label: 'Some are refreshing their look', categoricalWeights: { refresh: 3, refine: 2 } },
        { id: 'c', label: 'Several are making significant changes', categoricalWeights: { evolve: 3, refresh: 2 } },
        { id: 'd', label: 'The market is shifting fundamentally', categoricalWeights: { evolve: 2, rebrand: 3 } },
      ],
    },
    {
      id: 'q16',
      text: 'How much brand equity do you have in your current name and identity?',
      options: [
        { id: 'a', label: 'A lot — customers know us by name and trust it', categoricalWeights: { maintain: 4, refine: 2, refresh: 2 } },
        { id: 'b', label: 'Some — recognized but not strongly tied to identity', categoricalWeights: { refine: 3, refresh: 2, evolve: 1 } },
        { id: 'c', label: 'Little — not widely recognized or remembered', categoricalWeights: { evolve: 3, rebrand: 2 } },
        { id: 'd', label: 'None or negative — the name carries baggage', categoricalWeights: { rebrand: 5, evolve: 1 } },
      ],
    },
  ],
};
