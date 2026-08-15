// Centralized data for the Quizzed trivia demo.

export type GameMode = 'classic' | 'blitz' | 'survival';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'mixed';
export type CategoryId =
  | 'general'
  | 'science'
  | 'history'
  | 'geography'
  | 'movies'
  | 'music'
  | 'technology'
  | 'sports'
  | 'art'
  | 'food';

export interface Category {
  id: CategoryId;
  name: string;
  icon: string; // lucide icon key
  color: string;
  description: string;
}

export interface Question {
  id: string;
  category: CategoryId;
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  answers: string[]; // 4 options
  correctAnswer: string; // the actual correct text
  explanation: string;
  funFact?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  mode: GameMode;
  date: string;
}

// --- Categories ---
export const categories: Category[] = [
  { id: 'general', name: 'General Knowledge', icon: 'brain', color: '#3b82f6', description: 'A mix of everything' },
  { id: 'science', name: 'Science', icon: 'atom', color: '#06b6d4', description: 'Physics, chemistry, biology' },
  { id: 'history', name: 'History', icon: 'landmark', color: '#f59e0b', description: 'People, events, eras' },
  { id: 'geography', name: 'Geography', icon: 'globe', color: '#10b981', description: 'Places, capitals, nature' },
  { id: 'movies', name: 'Movies & TV', icon: 'film', color: '#ec4899', description: 'Films, shows, actors' },
  { id: 'music', name: 'Music', icon: 'music', color: '#8b5cf6', description: 'Artists, songs, genres' },
  { id: 'technology', name: 'Technology', icon: 'cpu', color: '#6366f1', description: 'Computing, gadgets, code' },
  { id: 'sports', name: 'Sports', icon: 'trophy', color: '#dc2626', description: 'Games, athletes, records' },
  { id: 'art', name: 'Art & Culture', icon: 'palette', color: '#f97316', description: 'Paintings, books, culture' },
  { id: 'food', name: 'Food', icon: 'utensils', color: '#84cc16', description: 'Cuisines, ingredients, dishes' },
];

// --- Difficulty config ---
export const difficultyConfig: Record<Difficulty, {
  label: string;
  multiplier: number;
  timerSeconds: number;
  description: string;
}> = {
  easy: { label: 'Easy', multiplier: 1.0, timerSeconds: 20, description: 'Longer timer · 1× score' },
  medium: { label: 'Medium', multiplier: 1.25, timerSeconds: 15, description: 'Standard timer · 1.25× score' },
  hard: { label: 'Hard', multiplier: 1.5, timerSeconds: 10, description: 'Short timer · 1.5× score' },
  mixed: { label: 'Mixed', multiplier: 1.25, timerSeconds: 15, description: 'Random difficulty · 1.25× score' },
};

// --- Mode config ---
export const modeConfig: Record<GameMode, {
  label: string;
  description: string;
  icon: string;
  color: string;
  questionCount: number | null; // null = unlimited
  blitzSeconds: number | null;
  lives: number | null;
  canPause: boolean;
  lifelines: boolean;
}> = {
  classic: {
    label: 'Classic',
    description: '10 questions · score points · use lifelines',
    icon: 'list-ordered',
    color: '#3b82f6',
    questionCount: 10,
    blitzSeconds: null,
    lives: null,
    canPause: true,
    lifelines: true,
  },
  blitz: {
    label: 'Blitz',
    description: '60 seconds · answer as many as you can',
    icon: 'zap',
    color: '#f59e0b',
    questionCount: null,
    blitzSeconds: 60,
    lives: null,
    canPause: false,
    lifelines: false,
  },
  survival: {
    label: 'Survival',
    description: '3 lives · play until you run out',
    icon: 'heart',
    color: '#dc2626',
    questionCount: null,
    blitzSeconds: null,
    lives: 3,
    canPause: true,
    lifelines: false,
  },
};

// --- Streak multiplier ---
export function streakMultiplier(streak: number): number {
  if (streak >= 5) return 1.25;
  if (streak >= 3) return 1.1;
  return 1.0;
}

export const streakLabels: { threshold: number; label: string }[] = [
  { threshold: 5, label: 'On Fire' },
  { threshold: 7, label: 'Unstoppable' },
  { threshold: 10, label: 'Perfect Run' },
];

export function streakLabel(streak: number): string | null {
  for (const s of streakLabels) {
    if (streak >= s.threshold) return s.label;
  }
  return null;
}

// --- Achievements ---
export const achievements: Achievement[] = [
  { id: 'first-win', name: 'First Win', description: 'Complete your first game', icon: 'flag' },
  { id: 'hot-streak', name: 'Hot Streak', description: 'Answer 5 correctly in a row', icon: 'flame' },
  { id: 'speed-demon', name: 'Speed Demon', description: 'Answer correctly with 80%+ timer remaining', icon: 'zap' },
  { id: 'perfect-round', name: 'Perfect Round', description: 'Complete Classic mode with 100% accuracy', icon: 'award' },
  { id: 'survivor', name: 'Survivor', description: 'Answer 10 questions in Survival mode', icon: 'shield' },
  { id: 'scholar', name: 'Scholar', description: 'Score 5000+ in 5 different categories', icon: 'graduation-cap' },
  { id: 'blitz-master', name: 'Blitz Master', description: 'Answer 15+ questions in a single Blitz game', icon: 'bolt' },
  { id: 'high-scorer', name: 'High Scorer', description: 'Score 15,000+ in a single game', icon: 'star' },
];

// --- Seeded leaderboard ---
export const seedLeaderboard: LeaderboardEntry[] = [
  { id: 'lb1', name: 'Nova', score: 12480, mode: 'classic', date: '2026-08-20' },
  { id: 'lb2', name: 'Kai', score: 11950, mode: 'classic', date: '2026-08-19' },
  { id: 'lb3', name: 'Mira', score: 10720, mode: 'blitz', date: '2026-08-18' },
  { id: 'lb4', name: 'Theo', score: 9340, mode: 'survival', date: '2026-08-17' },
  { id: 'lb5', name: 'Zara', score: 8210, mode: 'classic', date: '2026-08-16' },
  { id: 'lb6', name: 'Leo', score: 7150, mode: 'blitz', date: '2026-08-15' },
];

// --- Questions (100 total) ---
export const questions: Question[] = [
  // General Knowledge (10)
  { id: 'q1', category: 'general', difficulty: 'easy', question: 'How many continents are there on Earth?', answers: ['5', '6', '7', '8'], correctAnswer: '7', explanation: 'There are 7 continents: Africa, Antarctica, Asia, Australia, Europe, North America, and South America.' },
  { id: 'q2', category: 'general', difficulty: 'easy', question: 'What is the largest ocean on Earth?', answers: ['Atlantic', 'Indian', 'Arctic', 'Pacific'], correctAnswer: 'Pacific', explanation: 'The Pacific Ocean is the largest and deepest ocean, covering about 63 million square miles.' },
  { id: 'q3', category: 'general', difficulty: 'easy', question: 'How many sides does a hexagon have?', answers: ['5', '6', '7', '8'], correctAnswer: '6', explanation: 'A hexagon has 6 sides and 6 angles.' },
  { id: 'q4', category: 'general', difficulty: 'medium', question: 'What is the most spoken language in the world by native speakers?', answers: ['English', 'Hindi', 'Mandarin Chinese', 'Spanish'], correctAnswer: 'Mandarin Chinese', explanation: 'Mandarin Chinese has over 900 million native speakers, making it the most spoken language by native speakers.' },
  { id: 'q5', category: 'general', difficulty: 'medium', question: 'Which country has the most time zones?', answers: ['Russia', 'United States', 'France', 'China'], correctAnswer: 'France', explanation: 'France has 12 time zones (including overseas territories), more than any other country.', funFact: 'Russia spans 11 time zones but France beats it with its overseas territories.' },
  { id: 'q6', category: 'general', difficulty: 'medium', question: 'What is the currency of Japan?', answers: ['Won', 'Yuan', 'Yen', 'Ringgit'], correctAnswer: 'Yen', explanation: 'The Japanese Yen is the official currency of Japan, introduced in 1871.' },
  { id: 'q7', category: 'general', difficulty: 'hard', question: 'What is the only US state that does not have a rectangular flag?', answers: ['Ohio', 'Colorado', 'Wyoming', 'Nevada'], correctAnswer: 'Ohio', explanation: 'Ohio is the only US state with a non-rectangular flag, shaped like a swallowtail burgee.' },
  { id: 'q8', category: 'general', difficulty: 'hard', question: 'Which is the only planet in our solar system not named after a god?', answers: ['Mars', 'Earth', 'Venus', 'Jupiter'], correctAnswer: 'Earth', explanation: 'Earth is the only planet not named after a Roman or Greek god. The name comes from Old English and Germanic words meaning "ground."' },
  { id: 'q9', category: 'general', difficulty: 'easy', question: 'What color do you get by mixing blue and yellow?', answers: ['Green', 'Purple', 'Orange', 'Brown'], correctAnswer: 'Green', explanation: 'Mixing blue and yellow paint produces green.' },
  { id: 'q10', category: 'general', difficulty: 'hard', question: 'What is the smallest country in the world by population?', answers: ['Monaco', 'Nauru', 'Vatican City', 'Tuvalu'], correctAnswer: 'Vatican City', explanation: 'Vatican City has a population of around 800, making it the smallest country by both population and area.' },

  // Science (10)
  { id: 'q11', category: 'science', difficulty: 'easy', question: 'What gas do plants primarily absorb from the atmosphere?', answers: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'], correctAnswer: 'Carbon Dioxide', explanation: 'Plants absorb CO2 during photosynthesis and release oxygen.' },
  { id: 'q12', category: 'science', difficulty: 'easy', question: 'What is the chemical symbol for gold?', answers: ['Go', 'Au', 'Gd', 'Ag'], correctAnswer: 'Au', explanation: 'Gold\'s symbol Au comes from the Latin word "aurum," meaning "shining dawn."' },
  { id: 'q13', category: 'science', difficulty: 'easy', question: 'How many bones are in the adult human body?', answers: ['186', '206', '226', '246'], correctAnswer: '206', explanation: 'Adults have 206 bones. Babies are born with about 270, which fuse over time.' },
  { id: 'q14', category: 'science', difficulty: 'medium', question: 'What is the speed of light in a vacuum (approximately)?', answers: ['300,000 km/s', '150,000 km/s', '600,000 km/s', '1,000,000 km/s'], correctAnswer: '300,000 km/s', explanation: 'Light travels at approximately 299,792 kilometers per second in a vacuum.' },
  { id: 'q15', category: 'science', difficulty: 'medium', question: 'Which element has the atomic number 1?', answers: ['Helium', 'Oxygen', 'Hydrogen', 'Carbon'], correctAnswer: 'Hydrogen', explanation: 'Hydrogen is the lightest and most abundant element in the universe, with atomic number 1.' },
  { id: 'q16', category: 'science', difficulty: 'medium', question: 'What part of the cell contains the genetic material?', answers: ['Cytoplasm', 'Nucleus', 'Membrane', 'Ribosome'], correctAnswer: 'Nucleus', explanation: 'The nucleus houses DNA and controls cell activities.' },
  { id: 'q17', category: 'science', difficulty: 'hard', question: 'What is the Heisenberg Uncertainty Principle about?', answers: ['Energy conservation', 'Position and momentum', 'Wave-particle duality', 'Quantum entanglement'], correctAnswer: 'Position and momentum', explanation: 'It states you cannot simultaneously know both the exact position and momentum of a particle.' },
  { id: 'q18', category: 'science', difficulty: 'hard', question: 'Which type of rock is formed by the cooling of magma or lava?', answers: ['Sedimentary', 'Metamorphic', 'Igneous', 'Mineral'], correctAnswer: 'Igneous', explanation: 'Igneous rocks form when molten material cools and solidifies.' },
  { id: 'q19', category: 'science', difficulty: 'easy', question: 'What force keeps us on the ground?', answers: ['Magnetism', 'Gravity', 'Friction', 'Tension'], correctAnswer: 'Gravity', explanation: 'Gravity is the force that attracts objects with mass toward each other.' },
  { id: 'q20', category: 'science', difficulty: 'hard', question: 'What is the most abundant gas in Earth\'s atmosphere?', answers: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Argon'], correctAnswer: 'Nitrogen', explanation: 'Nitrogen makes up about 78% of Earth\'s atmosphere.' },

  // History (10)
  { id: 'q21', category: 'history', difficulty: 'easy', question: 'In what year did World War II end?', answers: ['1943', '1944', '1945', '1946'], correctAnswer: '1945', explanation: 'World War II ended in 1945 with the surrender of Germany in May and Japan in September.' },
  { id: 'q22', category: 'history', difficulty: 'easy', question: 'Who was the first President of the United States?', answers: ['Thomas Jefferson', 'George Washington', 'John Adams', 'Benjamin Franklin'], correctAnswer: 'George Washington', explanation: 'George Washington served as the first US President from 1789 to 1797.' },
  { id: 'q23', category: 'history', difficulty: 'easy', question: 'Which ancient civilization built the pyramids of Giza?', answers: ['Romans', 'Greeks', 'Egyptians', 'Persians'], correctAnswer: 'Egyptians', explanation: 'The ancient Egyptians built the pyramids as tombs for pharaohs over 4,500 years ago.' },
  { id: 'q24', category: 'history', difficulty: 'medium', question: 'The Berlin Wall fell in which year?', answers: ['1987', '1988', '1989', '1990'], correctAnswer: '1989', explanation: 'The Berlin Wall fell on November 9, 1989, symbolizing the end of the Cold War.' },
  { id: 'q25', category: 'history', difficulty: 'medium', question: 'Who painted the Mona Lisa?', answers: ['Michelangelo', 'Raphael', 'Leonardo da Vinci', 'Donatello'], correctAnswer: 'Leonardo da Vinci', explanation: 'Leonardo da Vinci painted the Mona Lisa between 1503 and 1519. It now hangs in the Louvre.' },
  { id: 'q26', category: 'history', difficulty: 'medium', question: 'The French Revolution began in which year?', answers: ['1769', '1789', '1799', '1809'], correctAnswer: '1789', explanation: 'The French Revolution began in 1789 with the storming of the Bastille on July 14.' },
  { id: 'q27', category: 'history', difficulty: 'hard', question: 'Who was the last Tsar of Russia?', answers: ['Alexander III', 'Nicholas II', 'Peter the Great', 'Ivan the Terrible'], correctAnswer: 'Nicholas II', explanation: 'Nicholas II was the last Emperor of Russia, abdicating in 1917 during the Russian Revolution.' },
  { id: 'q28', category: 'history', difficulty: 'hard', question: 'The Magna Carta was signed in which year?', answers: ['1066', '1215', '1295', '1492'], correctAnswer: '1215', explanation: 'The Magna Carta was signed by King John of England in 1215, establishing principles of limited government.' },
  { id: 'q29', category: 'history', difficulty: 'easy', question: 'Who discovered America in 1492?', answers: ['Christopher Columbus', 'Vasco da Gama', 'Ferdinand Magellan', 'James Cook'], correctAnswer: 'Christopher Columbus', explanation: 'Christopher Columbus reached the Americas in 1492, though Norse explorers had visited earlier.' },
  { id: 'q30', category: 'history', difficulty: 'hard', question: 'Which empire was ruled by Genghis Khan?', answers: ['Ottoman', 'Mongol', 'Persian', 'Roman'], correctAnswer: 'Mongol', explanation: 'Genghis Khan founded the Mongol Empire, which became the largest contiguous land empire in history.' },

  // Geography (10)
  { id: 'q31', category: 'geography', difficulty: 'easy', question: 'What is the capital of France?', answers: ['Berlin', 'Madrid', 'Paris', 'Rome'], correctAnswer: 'Paris', explanation: 'Paris is the capital and largest city of France, located on the Seine River.' },
  { id: 'q32', category: 'geography', difficulty: 'easy', question: 'What is the longest river in the world?', answers: ['Amazon', 'Nile', 'Yangtze', 'Mississippi'], correctAnswer: 'Nile', explanation: 'The Nile River in Africa is approximately 6,650 km long, traditionally considered the longest river.' },
  { id: 'q33', category: 'geography', difficulty: 'easy', question: 'Which is the largest country by area?', answers: ['China', 'Canada', 'United States', 'Russia'], correctAnswer: 'Russia', explanation: 'Russia is the largest country by area, spanning over 17 million square kilometers.' },
  { id: 'q34', category: 'geography', difficulty: 'medium', question: 'What is the capital of Australia?', answers: ['Sydney', 'Melbourne', 'Canberra', 'Perth'], correctAnswer: 'Canberra', explanation: 'Canberra was purpose-built as the capital, chosen as a compromise between Sydney and Melbourne.' },
  { id: 'q35', category: 'geography', difficulty: 'medium', question: 'Mount Everest is located on the border of which two countries?', answers: ['India and Nepal', 'Nepal and China', 'China and Bhutan', 'Pakistan and China'], correctAnswer: 'Nepal and China', explanation: 'Mount Everest sits on the border between Nepal and China (Tibet).' },
  { id: 'q36', category: 'geography', difficulty: 'medium', question: 'Which desert is the largest in the world?', answers: ['Sahara', 'Gobi', 'Antarctic Desert', 'Arabian'], correctAnswer: 'Antarctic Desert', explanation: 'The Antarctic Desert is the largest desert at about 14 million km². Not all deserts are hot!' },
  { id: 'q37', category: 'geography', difficulty: 'hard', question: 'What is the smallest country in the world by area?', answers: ['Monaco', 'San Marino', 'Vatican City', 'Liechtenstein'], correctAnswer: 'Vatican City', explanation: 'Vatican City covers just 0.49 square kilometers, making it the smallest country by area.' },
  { id: 'q38', category: 'geography', difficulty: 'hard', question: 'Which African country has the most pyramids?', answers: ['Egypt', 'Sudan', 'Ethiopia', 'Libya'], correctAnswer: 'Sudan', explanation: 'Sudan has about 200 pyramids, more than Egypt\'s ~130. They were built by the Kingdom of Kush.' },
  { id: 'q39', category: 'geography', difficulty: 'easy', question: 'What is the capital of Japan?', answers: ['Osaka', 'Kyoto', 'Tokyo', 'Nagoya'], correctAnswer: 'Tokyo', explanation: 'Tokyo is the capital of Japan and one of the most populous metropolitan areas in the world.' },
  { id: 'q40', category: 'geography', difficulty: 'medium', question: 'The Great Barrier Reef is located off the coast of which country?', answers: ['Indonesia', 'Philippines', 'Australia', 'New Zealand'], correctAnswer: 'Australia', explanation: 'The Great Barrier Reef is the world\'s largest coral reef system, stretching over 2,300 km off Australia\'s coast.' },

  // Movies & TV (10)
  { id: 'q41', category: 'movies', difficulty: 'easy', question: 'Which movie features the character Jack Dawson?', answers: ['The Notebook', 'Titanic', 'The Beach', 'Shutter Island'], correctAnswer: 'Titanic', explanation: 'Jack Dawson, played by Leonardo DiCaprio, is the male lead in James Cameron\'s 1997 film Titanic.' },
  { id: 'q42', category: 'movies', difficulty: 'easy', question: 'Who directed the movie "Jurassic Park" (1993)?', answers: ['George Lucas', 'Steven Spielberg', 'Ridley Scott', 'James Cameron'], correctAnswer: 'Steven Spielberg', explanation: 'Steven Spielberg directed Jurassic Park, released in 1993.' },
  { id: 'q43', category: 'movies', difficulty: 'easy', question: 'What color is the alien character Shrek?', answers: ['Blue', 'Purple', 'Green', 'Orange'], correctAnswer: 'Green', explanation: 'Shrek is a green ogre, voiced by Mike Myers in the animated film series.' },
  { id: 'q44', category: 'movies', difficulty: 'medium', question: 'Which TV series features the fictional town of Hawkins?', answers: ['The X-Files', 'Dark', 'Stranger Things', 'Fringe'], correctAnswer: 'Stranger Things', explanation: 'Hawkins, Indiana is the setting for the Netflix series Stranger Things.' },
  { id: 'q45', category: 'movies', difficulty: 'medium', question: 'Who played the Joker in "The Dark Knight" (2008)?', answers: ['Jared Leto', 'Joaquin Phoenix', 'Heath Ledger', 'Jack Nicholson'], correctAnswer: 'Heath Ledger', explanation: 'Heath Ledger won a posthumous Oscar for his performance as the Joker in The Dark Knight.' },
  { id: 'q46', category: 'movies', difficulty: 'medium', question: 'Which Pixar film features a rat who loves cooking?', answers: ['Ratatouille', 'Coco', 'Up', 'Brave'], correctAnswer: 'Ratatouille', explanation: 'Ratatouille (2007) follows Remy, a rat who dreams of becoming a chef in Paris.' },
  { id: 'q47', category: 'movies', difficulty: 'hard', question: 'Which film won the first Academy Award for Best Picture?', answers: ['Wings', 'Sunrise', 'The Jazz Singer', 'Metropolis'], correctAnswer: 'Wings', explanation: 'Wings (1927) won the first Academy Award for Best Picture at the inaugural ceremony in 1929.' },
  { id: 'q48', category: 'movies', difficulty: 'hard', question: 'In "Breaking Bad," what is Walter White\'s alias?', answers: ['Heisenberg', 'Capone', 'Escobar', 'Scarface'], correctAnswer: 'Heisenberg', explanation: 'Walter White adopts the alias "Heisenberg," named after the physicist Werner Heisenberg.' },
  { id: 'q49', category: 'movies', difficulty: 'easy', question: 'How many "Harry Potter" films were made?', answers: ['7', '8', '9', '10'], correctAnswer: '8', explanation: 'There are 8 Harry Potter films, adapted from the 7 books (the final book was split into two films).' },
  { id: 'q50', category: 'movies', difficulty: 'medium', question: 'Which streaming service produced "The Crown"?', answers: ['Amazon Prime', 'HBO Max', 'Netflix', 'Disney+'], correctAnswer: 'Netflix', explanation: 'The Crown is a Netflix original series about the reign of Queen Elizabeth II.' },

  // Music (10)
  { id: 'q51', category: 'music', difficulty: 'easy', question: 'How many strings does a standard guitar have?', answers: ['4', '5', '6', '7'], correctAnswer: '6', explanation: 'A standard guitar has 6 strings tuned to E, A, D, G, B, and E.' },
  { id: 'q52', category: 'music', difficulty: 'easy', question: 'Which band performed "Bohemian Rhapsody"?', answers: ['The Beatles', 'Queen', 'Led Zeppelin', 'Pink Floyd'], correctAnswer: 'Queen', explanation: 'Queen released "Bohemian Rhapsody" in 1975, written by Freddie Mercury.' },
  { id: 'q53', category: 'music', difficulty: 'easy', question: 'What instrument has 88 keys?', answers: ['Organ', 'Piano', 'Harpsichord', 'Accordion'], correctAnswer: 'Piano', explanation: 'A standard piano has 88 keys — 52 white and 36 black.' },
  { id: 'q54', category: 'music', difficulty: 'medium', question: 'Who is known as the "King of Pop"?', answers: ['Elvis Presley', 'Michael Jackson', 'Prince', 'David Bowie'], correctAnswer: 'Michael Jackson', explanation: 'Michael Jackson earned the title "King of Pop" for his global influence on popular music.' },
  { id: 'q55', category: 'music', difficulty: 'medium', question: 'Which composer wrote "The Four Seasons"?', answers: ['Mozart', 'Bach', 'Vivaldi', 'Beethoven'], correctAnswer: 'Vivaldi', explanation: 'Antonio Vivaldi composed The Four Seasons around 1720, a set of four violin concertos.' },
  { id: 'q56', category: 'music', difficulty: 'medium', question: 'What genre of music originated in Jamaica in the late 1960s?', answers: ['Salsa', 'Reggae', 'Samba', 'Calypso'], correctAnswer: 'Reggae', explanation: 'Reggae emerged in Jamaica in the late 1960s, with Bob Marley as its most famous artist.' },
  { id: 'q57', category: 'music', difficulty: 'hard', question: 'In music theory, how many notes are in a chromatic scale?', answers: ['7', '10', '12', '14'], correctAnswer: '12', explanation: 'A chromatic scale has 12 notes, using all semitones within an octave.' },
  { id: 'q58', category: 'music', difficulty: 'hard', question: 'Which Beatles album was their last recorded studio album?', answers: ['Help!', 'Abbey Road', 'Let It Be', 'Revolver'], correctAnswer: 'Abbey Road', explanation: 'Abbey Road was the last album the Beatles recorded together, though Let It Be was released last.' },
  { id: 'q59', category: 'music', difficulty: 'easy', question: 'What does "forte" mean in music?', answers: ['Soft', 'Fast', 'Loud', 'Slow'], correctAnswer: 'Loud', explanation: 'Forte (f) is an Italian musical term meaning "loud" or "strong."' },
  { id: 'q60', category: 'music', difficulty: 'hard', question: 'Who composed the "1812 Overture"?', answers: ['Tchaikovsky', 'Rimsky-Korsakov', 'Borodin', 'Mussorgsky'], correctAnswer: 'Tchaikovsky', explanation: 'Pyotr Tchaikovsky composed the 1812 Overture in 1880, commemorating Russia\'s defense against Napoleon.' },

  // Technology (10)
  { id: 'q61', category: 'technology', difficulty: 'easy', question: 'What does "CPU" stand for?', answers: ['Central Processing Unit', 'Computer Personal Unit', 'Central Program Utility', 'Core Processing Unit'], correctAnswer: 'Central Processing Unit', explanation: 'The CPU (Central Processing Unit) is the primary component that executes instructions in a computer.' },
  { id: 'q62', category: 'technology', difficulty: 'easy', question: 'Who co-founded Apple Inc. with Steve Jobs?', answers: ['Bill Gates', 'Steve Wozniak', 'Paul Allen', 'Larry Page'], correctAnswer: 'Steve Wozniak', explanation: 'Steve Wozniak co-founded Apple with Steve Jobs in 1976.' },
  { id: 'q63', category: 'technology', difficulty: 'easy', question: 'What does "HTTP" stand for?', answers: ['HyperText Transfer Protocol', 'High Tech Transfer Process', 'HyperText Transmission Protocol', 'Home Transfer Text Protocol'], correctAnswer: 'HyperText Transfer Protocol', explanation: 'HTTP is the protocol used for transmitting web data over the internet.' },
  { id: 'q64', category: 'technology', difficulty: 'medium', question: 'Which programming language was created by Brendan Eich in 1995?', answers: ['Python', 'Java', 'JavaScript', 'Ruby'], correctAnswer: 'JavaScript', explanation: 'Brendan Eich created JavaScript in just 10 days in May 1995 at Netscape.' },
  { id: 'q65', category: 'technology', difficulty: 'medium', question: 'What does "RAM" stand for?', answers: ['Read Access Memory', 'Random Access Memory', 'Rapid Access Module', 'Read Available Memory'], correctAnswer: 'Random Access Memory', explanation: 'RAM (Random Access Memory) is volatile memory that stores data temporarily for quick access.' },
  { id: 'q66', category: 'technology', difficulty: 'medium', question: 'Which company developed the Android operating system?', answers: ['Apple', 'Microsoft', 'Google', 'Samsung'], correctAnswer: 'Google', explanation: 'Android was developed by Google, based on the Linux kernel, and primarily designed for touchscreen devices.' },
  { id: 'q67', category: 'technology', difficulty: 'hard', question: 'What does "SQL" stand for?', answers: ['Structured Query Language', 'Simple Query Logic', 'System Query Language', 'Standard Question Language'], correctAnswer: 'Structured Query Language', explanation: 'SQL (Structured Query Language) is used for managing and manipulating relational databases.' },
  { id: 'q68', category: 'technology', difficulty: 'hard', question: 'In binary, what number is represented by "1010"?', answers: ['8', '10', '12', '14'], correctAnswer: '10', explanation: '1010 in binary = 8 + 0 + 2 + 0 = 10 in decimal.' },
  { id: 'q69', category: 'technology', difficulty: 'easy', question: 'What does "Wi-Fi" commonly refer to?', answers: ['Wired Fidelity', 'Wireless Fidelity', 'Wide Frequency', 'Wireless Frequency'], correctAnswer: 'Wireless Fidelity', explanation: 'Wi-Fi is a wireless networking technology using the IEEE 802.11 standards.' },
  { id: 'q70', category: 'technology', difficulty: 'hard', question: 'Which sorting algorithm has an average time complexity of O(n log n)?', answers: ['Bubble Sort', 'Selection Sort', 'Quick Sort', 'Insertion Sort'], correctAnswer: 'Quick Sort', explanation: 'Quick Sort has an average time complexity of O(n log n), though worst case is O(n²).' },

  // Sports (10)
  { id: 'q71', category: 'sports', difficulty: 'easy', question: 'How many players are on a soccer team on the field?', answers: ['9', '10', '11', '12'], correctAnswer: '11', explanation: 'A soccer team has 11 players on the field, including the goalkeeper.' },
  { id: 'q72', category: 'sports', difficulty: 'easy', question: 'In which sport would you perform a slam dunk?', answers: ['Volleyball', 'Basketball', 'Tennis', 'Baseball'], correctAnswer: 'Basketball', explanation: 'A slam dunk is a basketball shot where a player jumps and pushes the ball through the rim.' },
  { id: 'q73', category: 'sports', difficulty: 'easy', question: 'How often are the Summer Olympics held?', answers: ['Every 2 years', 'Every 3 years', 'Every 4 years', 'Every 5 years'], correctAnswer: 'Every 4 years', explanation: 'The Summer Olympics are held every 4 years. The Winter Olympics also occur every 4 years, staggered.' },
  { id: 'q74', category: 'sports', difficulty: 'medium', question: 'In tennis, what is a score of zero called?', answers: ['Zero', 'Nil', 'Love', 'Nothing'], correctAnswer: 'Love', explanation: 'In tennis, zero is called "love." The term may come from the French word "l\'oeuf" (egg), representing zero.' },
  { id: 'q75', category: 'sports', difficulty: 'medium', question: 'How many holes are in a standard round of golf?', answers: ['12', '16', '18', '24'], correctAnswer: '18', explanation: 'A standard round of golf consists of 18 holes.' },
  { id: 'q76', category: 'sports', difficulty: 'medium', question: 'Which country has won the most FIFA World Cup titles?', answers: ['Germany', 'Brazil', 'Italy', 'Argentina'], correctAnswer: 'Brazil', explanation: 'Brazil has won 5 FIFA World Cup titles (1958, 1962, 1970, 1994, 2002).' },
  { id: 'q77', category: 'sports', difficulty: 'hard', question: 'In which year were the first modern Olympic Games held?', answers: ['1892', '1896', '1900', '1904'], correctAnswer: '1896', explanation: 'The first modern Olympic Games were held in Athens, Greece, in 1896.' },
  { id: 'q78', category: 'sports', difficulty: 'hard', question: 'What is the maximum break in snooker?', answers: ['147', '155', '160', '180'], correctAnswer: '147', explanation: 'The maximum break in snooker is 147, achieved by potting all 15 reds with 15 blacks and all colors.' },
  { id: 'q79', category: 'sports', difficulty: 'easy', question: 'What sport is associated with Wimbledon?', answers: ['Cricket', 'Tennis', 'Golf', 'Rugby'], correctAnswer: 'Tennis', explanation: 'Wimbledon is the oldest tennis tournament in the world, held annually in London since 1877.' },
  { id: 'q80', category: 'sports', difficulty: 'hard', question: 'Who was the first boxer to defeat Muhammad Ali as a professional?', answers: ['Joe Frazier', 'George Foreman', 'Ken Norton', 'Leon Spinks'], correctAnswer: 'Joe Frazier', explanation: 'Joe Frazier defeated Muhammad Ali on March 8, 1971, in the "Fight of the Century."' },

  // Art & Culture (10)
  { id: 'q81', category: 'art', difficulty: 'easy', question: 'Who painted the ceiling of the Sistine Chapel?', answers: ['Raphael', 'Michelangelo', 'Donatello', 'Botticelli'], correctAnswer: 'Michelangelo', explanation: 'Michelangelo painted the Sistine Chapel ceiling between 1508 and 1512.' },
  { id: 'q82', category: 'art', difficulty: 'easy', question: 'What is the famous statue by Auguste Rodin showing a thinker?', answers: ['The Ponderer', 'The Thinker', 'The Philosopher', 'The Sage'], correctAnswer: 'The Thinker', explanation: '"The Thinker" was originally part of Rodin\'s larger work "The Gates of Hell," begun in 1880.' },
  { id: 'q83', category: 'art', difficulty: 'easy', question: 'Who wrote "Romeo and Juliet"?', answers: ['Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Mark Twain'], correctAnswer: 'William Shakespeare', explanation: 'Shakespeare wrote "Romeo and Juliet" in the early 1590s.' },
  { id: 'q84', category: 'art', difficulty: 'medium', question: 'Which art movement is Salvador Dalí associated with?', answers: ['Cubism', 'Impressionism', 'Surrealism', 'Pop Art'], correctAnswer: 'Surrealism', explanation: 'Salvador Dalí was a leading figure in Surrealism, known for dreamlike images like "The Persistence of Memory."' },
  { id: 'q85', category: 'art', difficulty: 'medium', question: 'What is the Japanese art of folding paper called?', answers: ['Ikebana', 'Origami', 'Kintsugi', 'Bonsai'], correctAnswer: 'Origami', explanation: 'Origami is the art of paper folding, from "oru" (fold) and "kami" (paper).' },
  { id: 'q86', category: 'art', difficulty: 'medium', question: 'Who wrote the novel "1984"?', answers: ['Aldous Huxley', 'George Orwell', 'Ray Bradbury', 'H.G. Wells'], correctAnswer: 'George Orwell', explanation: 'George Orwell published "1984" in 1949, a dystopian novel about totalitarian surveillance.' },
  { id: 'q87', category: 'art', difficulty: 'hard', question: 'Which museum houses "The Starry Night" by Van Gogh?', answers: ['The Louvre', 'MoMA', 'The Met', 'Prado'], correctAnswer: 'MoMA', explanation: '"The Starry Night" is at the Museum of Modern Art (MoMA) in New York City.' },
  { id: 'q88', category: 'art', difficulty: 'hard', question: 'In which century was the Mona Lisa painted?', answers: ['14th century', '15th century', '16th century', '17th century'], correctAnswer: '16th century', explanation: 'Leonardo da Vinci painted the Mona Lisa in the early 16th century, around 1503-1519.' },
  { id: 'q89', category: 'art', difficulty: 'easy', question: 'What color did Vincent van Gogh famously use in "The Starry Night"?', answers: ['Red', 'Blue', 'Green', 'Yellow'], correctAnswer: 'Blue', explanation: 'The Starry Night is dominated by swirling blue tones, contrasting with bright yellow stars.' },
  { id: 'q90', category: 'art', difficulty: 'hard', question: 'Who composed the opera "The Magic Flute"?', answers: ['Verdi', 'Mozart', 'Wagner', 'Puccini'], correctAnswer: 'Mozart', explanation: 'Mozart composed "The Magic Flute" in 1791, the year of his death.' },

  // Food (10)
  { id: 'q91', category: 'food', difficulty: 'easy', question: 'What is the main ingredient in guacamole?', answers: ['Tomato', 'Avocado', 'Pepper', 'Onion'], correctAnswer: 'Avocado', explanation: 'Guacamole is primarily made from mashed avocados, originating in Mexico.' },
  { id: 'q92', category: 'food', difficulty: 'easy', question: 'Which country is sushi originally from?', answers: ['China', 'Korea', 'Japan', 'Thailand'], correctAnswer: 'Japan', explanation: 'Sushi originated in Japan, with its modern form developing in the Edo period (19th century).' },
  { id: 'q93', category: 'food', difficulty: 'easy', question: 'What is the main ingredient in bread?', answers: ['Rice', 'Flour', 'Corn', 'Oats'], correctAnswer: 'Flour', explanation: 'Flour is the primary ingredient in bread, typically wheat flour.' },
  { id: 'q94', category: 'food', difficulty: 'medium', question: 'What spice is the most expensive in the world by weight?', answers: ['Saffron', 'Vanilla', 'Cardamom', 'Cinnamon'], correctAnswer: 'Saffron', explanation: 'Saffron is the most expensive spice, costing up to $5,000 per pound due to labor-intensive harvesting.' },
  { id: 'q95', category: 'food', difficulty: 'medium', question: 'Which country is the origin of the croissant?', answers: ['France', 'Austria', 'Germany', 'Italy'], correctAnswer: 'Austria', explanation: 'The croissant originated in Austria as the "kipferl" before being adapted in France.' },
  { id: 'q96', category: 'food', difficulty: 'medium', question: 'What is the national dish of Spain?', answers: ['Paella', 'Tapas', 'Gazpacho', 'Tortilla'], correctAnswer: 'Paella', explanation: 'Paella is widely considered Spain\'s national dish, originating from Valencia.' },
  { id: 'q97', category: 'food', difficulty: 'hard', question: 'What is the main flavoring in the liqueur "absinthe"?', answers: ['Anise', 'Wormwood', 'Mint', 'Fennel'], correctAnswer: 'Wormwood', explanation: 'Absinthe is flavored with wormwood (Artemisia absinthium), anise, and fennel.' },
  { id: 'q98', category: 'food', difficulty: 'hard', question: 'Which fruit is used to make the drink "calvados"?', answers: ['Grapes', 'Apples', 'Pears', 'Plums'], correctAnswer: 'Apples', explanation: 'Calvados is an apple brandy from the Normandy region of France.' },
  { id: 'q99', category: 'food', difficulty: 'easy', question: 'What is tofu made from?', answers: ['Rice', 'Soybeans', 'Wheat', 'Corn'], correctAnswer: 'Soybeans', explanation: 'Tofu is made by coagulating soy milk and pressing the curds into blocks.' },
  { id: 'q100', category: 'food', difficulty: 'hard', question: 'Which spice comes from the Crocus sativus flower?', answers: ['Turmeric', 'Saffron', 'Paprika', 'Cumin'], correctAnswer: 'Saffron', explanation: 'Saffron threads are the stigmas of the Crocus sativus flower, each producing only 3 threads.' },
];
