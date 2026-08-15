// Typing test text passages — original, generic content.
// No copyrighted material.

export interface TextSample {
  id: string;
  text: string;
  difficulty: 'normal' | 'advanced';
}

export const typingSamples: TextSample[] = [
  { id: 't01', difficulty: 'normal', text: 'the quick brown fox jumps over the lazy dog while the sun sets behind the hills and the wind carries the scent of pine trees across the valley' },
  { id: 't02', difficulty: 'normal', text: 'a good design is not about making things look pretty it is about making things work well and feel right for the people who use them every single day' },
  { id: 't03', difficulty: 'normal', text: 'the best ideas often come when you least expect them sometimes while walking through the park or making coffee in the morning before the day begins' },
  { id: 't04', difficulty: 'normal', text: 'simple solutions are usually the hardest to find because they require you to understand the problem deeply before you can strip away everything that is not needed' },
  { id: 't05', difficulty: 'normal', text: 'the river flows quietly through the forest carrying leaves and small branches along the way while birds sing in the canopy above the gentle current' },
  { id: 't06', difficulty: 'normal', text: 'every great project starts with a simple question and the willingness to explore many possible answers before settling on the one that feels most natural' },
  { id: 't07', difficulty: 'normal', text: 'the morning light filters through the window casting long shadows across the desk where a cup of coffee sits next to an open notebook waiting for ideas' },
  { id: 't08', difficulty: 'normal', text: 'working with a team means listening carefully sharing openly and trusting that each person brings something valuable to the table even when opinions differ' },
  { id: 't09', difficulty: 'normal', text: 'the art of storytelling is about finding the balance between what to say and what to leave out so the audience can fill in the gaps with their own imagination' },
  { id: 't10', difficulty: 'normal', text: 'a long walk through the city reveals hidden corners small cafes and unexpected gardens that you would never notice from inside a car or a bus' },
  { id: 't11', difficulty: 'normal', text: 'the process of learning never really ends no matter how much you know there is always another book to read another skill to practice another perspective to consider' },
  { id: 't12', difficulty: 'normal', text: 'good habits built slowly over time are more powerful than grand gestures because they shape who you become through small consistent actions repeated daily' },
  { id: 't13', difficulty: 'advanced', text: 'The meeting was scheduled for 3:30 PM on Thursday, March 14th. Attendees included 5 designers, 2 developers, and 1 project manager. The agenda covered Q1 results, Q2 priorities, and a 2025 roadmap review.' },
  { id: 't14', difficulty: 'advanced', text: `Did you know that the human eye can distinguish approximately 10 million colors? That's 10,000,000+ unique hues! The visible spectrum ranges from ~380nm (violet) to ~700nm (red).` },
  { id: 't15', difficulty: 'advanced', text: `The function calculateTotal(price, tax_rate) returns price * (1 + tax_rate/100). For example: $50.00 at 8.5% tax = $54.25. Note: this doesn't include shipping ($5.99 flat rate) or discounts.` },
  { id: 't16', difficulty: 'advanced', text: `In 1969, Apollo 11 landed on the moon. Neil Armstrong said, "That's one small step for man, one giant leap for mankind." An estimated 650M people watched the broadcast live on July 20th.` },
  { id: 't17', difficulty: 'advanced', text: `The CSS property "transform: rotate(45deg) scale(1.5);" rotates an element 45° clockwise and scales it 150%. Combined with "transition: transform 0.3s ease-out," you get smooth animations.` },
  { id: 't18', difficulty: 'advanced', text: `A/B testing compares 2 versions: Version A (control) vs. Version B (variant). If B's conversion rate is 12.5% vs. A's 10.0%, that's a +25% relative lift. Statistical significance requires p < 0.05.` },
  { id: 't19', difficulty: 'advanced', text: `The recipe calls for 2½ cups flour, 1¾ cups sugar, 3 eggs, 1 tsp. vanilla extract, and ¼ tsp. salt. Bake at 350°F for 25-30 minutes. Yield: ~24 cookies. Cost: ~$8.50 total.` },
  { id: 't20', difficulty: 'advanced', text: `HTTP status codes: 200 (OK), 301 (Moved Permanently), 404 (Not Found), 429 (Too Many Requests), 500 (Internal Server Error). The "4xx" range indicates client-side errors; "5xx" = server-side.` },
];

export const normalSamples = typingSamples.filter((s) => s.difficulty === 'normal');
export const advancedSamples = typingSamples.filter((s) => s.difficulty === 'advanced');
