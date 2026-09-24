export type QuestionType = 'text' | 'select' | 'scale';

export interface Question {
  id: string;
  type: QuestionType;
  label: string;
  description?: string;
  placeholder?: string;
  options?: string[];
  min?: number;
  max?: number;
  minLabel?: string;
  maxLabel?: string;
  correctAnswer?: string | number;
  acceptedAlternatives?: string[];
  explanation?: string;
}

export const MIN_QUESTIONS_COUNT = 5;
export const MAX_QUESTIONS_COUNT = 20;

export const DEFAULT_QUESTIONS: Question[] = [
  {
    id: 'q1',
    type: 'text',
    label: 'What is my middle name?',
    description: 'Bonus points if you can spell it correctly!',
    placeholder: 'Type your guess here...',
    correctAnswer: 'Kwame',
    acceptedAlternatives: ['kwame', 'kofi', 'mensah', 'kweku', 'denzel', 'denzel kwame'],
    explanation: 'Denzel Kwame Mensah',
  },
  {
    id: 'q2',
    type: 'select',
    label: 'What is my favorite comfort food?',
    description: 'Pick the one you think I would choose for my last meal.',
    options: [
      'Artisanal Pizza & Pasta',
      'Smash Burgers & Crispy Fries',
      'Fresh Sushi & Spicy Ramen',
      'Authentic Tacos & Quesadillas',
      'Warm Home-Cooked Stew / Curry',
      'Ice Cream, Pastries & Sweet Treats',
    ],
    correctAnswer: 'Fresh Sushi & Spicy Ramen',
    explanation: 'Cannot resist fresh salmon nigiri and rich tonkotsu broth!',
  },
  {
    id: 'q3',
    type: 'scale',
    label: 'How well do you genuinely know me? (1-10)',
    description: 'Be completely honest with yourself!',
    min: 1,
    max: 10,
    minLabel: 'Barely know you',
    maxLabel: 'Soulmate / Mind Reader',
    correctAnswer: 10,
    acceptedAlternatives: ['9', '10'],
    explanation: 'Self-proclaimed mind readers only!',
  },
  {
    id: 'q4',
    type: 'select',
    label: 'What is my go-to morning drink or daily fuel?',
    description: 'Without this, I might not function.',
    options: [
      'Bold Black Drip Coffee',
      'Iced Oat Milk Latte / Flat White',
      'Matcha Green Tea Latte',
      'Spiced Chai Latte',
      'Hot Chocolate / Mocha',
      'Chilled Water / Lemon Herbal Tea',
    ],
    correctAnswer: 'Iced Oat Milk Latte / Flat White',
    explanation: 'Double espresso with silky creamy oat milk is non-negotiable.',
  },
  {
    id: 'q5',
    type: 'text',
    label: 'What is my biggest pet peeve or thing that ticks me off?',
    description: 'Think of the tiny annoyances that make my eyes twitch.',
    placeholder: 'E.g., chewing loudly, being late, slow walkers...',
    correctAnswer: 'Chewing loudly',
    acceptedAlternatives: [
      'chewing',
      'loud chewing',
      'chewing loudly',
      'being late',
      'tardiness',
      'slow walkers',
      'interrupting',
      'walking slow',
      'people chewing loud',
    ],
    explanation: 'Loud open-mouth chewing makes the soul cringe.',
  },
  {
    id: 'q6',
    type: 'select',
    label: 'My perfect Saturday looks like...',
    description: 'How would you catch me spending my ideal weekend day?',
    options: [
      'Nowhere to be, nothing to do',
      'Out all day with people',
      'A long drive somewhere new',
      'Deep in a project',
    ],
    correctAnswer: 'Nowhere to be, nothing to do',
    explanation: 'A zero-obligation Saturday morning with good coffee and chill music.',
  },
  {
    id: 'q7',
    type: 'select',
    label: 'If I could teleport anywhere tomorrow for vacation, where would I go?',
    description: 'Dream itinerary style.',
    options: [
      'Electric Metropolis (Tokyo, Seoul, NYC)',
      'Secluded Alpine Cabin in the Mountains',
      'Sun-drenched Beach (Amalfi Coast, Bali, Riviera)',
      'Off-grid Road Trip (Iceland, Patagonia, National Parks)',
      'Historic European Cities (Rome, Florence, Edinburgh)',
    ],
    correctAnswer: 'Electric Metropolis (Tokyo, Seoul, NYC)',
    explanation: 'High energy, incredible neon streetscapes, and 2 AM food runs.',
  },
  {
    id: 'q8',
    type: 'text',
    label: 'What genre of music or artist do you most often catch me vibing to?',
    description: 'In the car, in my headphones, or on speaker.',
    placeholder: 'Artist name or favorite vibe...',
    correctAnswer: 'Kendrick Lamar',
    acceptedAlternatives: [
      'kendrick',
      'kendrick lamar',
      'afrobeats',
      'burna boy',
      'asake',
      'drake',
      'r&b',
      'hip hop',
      'rap',
      'j cole',
      'sza',
      'frank ocean',
    ],
    explanation: 'Kendrick, lyrical hip hop, and smooth vibes.',
  },
  {
    id: 'q9',
    type: 'scale',
    label: 'How likely am I to be running late to plans? (1-10)',
    description: 'Punctuality check: 1 = early bird, 10 = running on my own timezone.',
    min: 1,
    max: 10,
    minLabel: 'Always 15m Early',
    maxLabel: 'Fashionably 20m Late',
    correctAnswer: 3,
    acceptedAlternatives: ['2', '3', '4'],
    explanation: 'Usually reliable and punctual, barring unpredictable traffic!',
  },
  {
    id: 'q10',
    type: 'select',
    label: 'How do I typically unwind after a demanding, chaotic day?',
    description: 'My natural decompression routine.',
    options: [
      'Binge-watching shows, movies, or gaming',
      'Intense workout, gym session, or outdoor run',
      'Dialing up a close friend to vent and laugh',
      'Cooking a relaxed gourmet meal with playlist on',
      'Taking a hot shower and going straight to bed early',
    ],
    correctAnswer: 'Cooking a relaxed gourmet meal with playlist on',
    explanation: 'Chopping garlic, simmering spices, and turning on soul beats.',
  },
  {
    id: 'q11',
    type: 'text',
    label: 'What is my secret talent, signature quirk, or funny habit?',
    description: 'Something distinct that only real ones know.',
    placeholder: 'Share a memory or unique habit...',
    correctAnswer: 'Cooking without a recipe',
    acceptedAlternatives: [
      'cooking',
      'cooking without recipe',
      'dancing',
      'humming',
      'freestyling',
      'making playlists',
      'mimicking accents',
      'chef',
      'great cook',
    ],
    explanation: 'Cooking strictly by aroma and vibe with zero recipes.',
  },
  {
    id: 'q12',
    type: 'scale',
    label: 'In a sudden zombie apocalypse, what are my survival odds? (1-10)',
    description: 'Survival instinct, tactical thinking, and athletic capability.',
    min: 1,
    max: 10,
    minLabel: 'First 10 mins casualty',
    maxLabel: 'Will lead the survivor colony',
    correctAnswer: 9,
    acceptedAlternatives: ['8', '9', '10'],
    explanation: 'Fast reflexes, tactical stealth, and great cardio.',
  },
  {
    id: 'q13',
    type: 'select',
    label: 'What is my dream car or vehicle?',
    description: 'If budget was unlimited.',
    options: [
      'Vintage Porsche 911 (Classic Black or Olive)',
      'Matte Black Mercedes G-Wagon',
      'Sleek Electric Tesla or Taycan',
      'Classic Vintage Muscle Car (1969 Mustang)',
      'Range Rover Defender Overland Spec',
    ],
    correctAnswer: 'Vintage Porsche 911 (Classic Black or Olive)',
    explanation: 'Timeless engineering, air-cooled, pure aesthetic perfection.',
  },
  {
    id: 'q14',
    type: 'select',
    label: 'Am I an early bird or a night owl?',
    description: 'When does my peak brainpower happen?',
    options: [
      'Early Bird (Dawn patrol, 6 AM workout)',
      'Night Owl (Creativity peaks at 1 AM)',
      'Afternoon Person (Need 4 hours to boot up)',
      'Sleep is for the weak, constantly awake',
    ],
    correctAnswer: 'Night Owl (Creativity peaks at 1 AM)',
    explanation: 'The world is quiet at midnight and ideas flow freely.',
  },
  {
    id: 'q15',
    type: 'select',
    label: 'What is my most used emoji in text messages?',
    description: 'Check your chat history with me!',
    options: [
      '😭 (Crying laughing / hysterical)',
      '💀 (Dead / hilarious)',
      '🫡 (Salute / understood)',
      '🔥 (Fire / hype)',
      '👀 (Eyes / intrigued)',
    ],
    correctAnswer: '😭 (Crying laughing / hysterical)',
    explanation: 'Used for literally everything funny or shocking.',
  },
  {
    id: 'q16',
    type: 'select',
    label: 'What is my footwear of choice on a casual day?',
    description: 'What shoes will you catch me in most days?',
    options: [
      'Clean Retro Runners (Asics, New Balance 990, Sambas)',
      'High-top Jordan 1s or Dunks',
      'Minimalist Leather Boots',
      'Comfortable Slides / Birkenstocks with socks',
    ],
    correctAnswer: 'Clean Retro Runners (Asics, New Balance 990, Sambas)',
    explanation: 'Comfort meets understated street style.',
  },
  {
    id: 'q17',
    type: 'select',
    label: 'If I had $10,000 to spend in one afternoon, what would I buy?',
    description: 'No investing allowed, must spend today.',
    options: [
      'High-end tech setup, audio gear, and travel tickets',
      'Designer wardrobe, jewelry, and luxury watches',
      'VIP table and legendary party for all close friends',
      'Gourmet dining tour across the top Michelin restaurants',
    ],
    correctAnswer: 'High-end tech setup, audio gear, and travel tickets',
    explanation: 'Experiential travel and top-tier creative tools over flashy jewelry.',
  },
  {
    id: 'q18',
    type: 'select',
    label: 'What kind of movie or series can I rewatch endlessly without getting bored?',
    description: 'My comfort genre.',
    options: [
      'Psychological Thrillers & Sci-Fi Masterpieces (Inception, Interstellar)',
      'Laugh-out-loud sitcoms (The Office, Brooklyn 99)',
      'Epic fantasy & superhero sagas (Lord of the Rings, Marvel)',
      'Crime dramas & mob classics (The Godfather, Narcos)',
    ],
    correctAnswer: 'Psychological Thrillers & Sci-Fi Masterpieces (Inception, Interstellar)',
    explanation: 'Mind-bending plots with incredible Hans Zimmer scores.',
  },
  {
    id: 'q19',
    type: 'scale',
    label: 'How competitive am I during board games or Mario Kart? (1-10)',
    description: 'Game night intensity check.',
    min: 1,
    max: 10,
    minLabel: 'Just here for fun',
    maxLabel: 'Winning is my full-time job',
    correctAnswer: 9,
    acceptedAlternatives: ['8', '9', '10'],
    explanation: 'Blue shells have ended friendships before.',
  },
  {
    id: 'q20',
    type: 'select',
    label: 'What is my primary way of showing love and care?',
    description: 'My core love language.',
    options: [
      'Quality Time & Deep late-night talks',
      'Acts of Service (helping fix things, bringing food)',
      'Hyping you up unconditionally & words of affirmation',
      'Giving thoughtful, hyper-specific gifts',
    ],
    correctAnswer: 'Quality Time & Deep late-night talks',
    explanation: 'Being present and truly listening means everything.',
  },
];

// Re-export static questions for initial compatibility
export const questions = DEFAULT_QUESTIONS;

const QUESTIONS_STORAGE_KEY = 'denzel_quiz_custom_questions_v2';
const ACTIVE_COUNT_STORAGE_KEY = 'denzel_quiz_active_count_v2';

/**
 * Get active questions count (between 5 and 20, default 12)
 */
export function getActiveQuestionsCount(): number {
  try {
    const raw = localStorage.getItem(ACTIVE_COUNT_STORAGE_KEY);
    if (raw) {
      const parsed = parseInt(raw, 10);
      if (!isNaN(parsed) && parsed >= MIN_QUESTIONS_COUNT && parsed <= MAX_QUESTIONS_COUNT) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return 12;
}

/**
 * Save active questions count
 */
export function setActiveQuestionsCount(count: number): void {
  const safeCount = Math.max(MIN_QUESTIONS_COUNT, Math.min(MAX_QUESTIONS_COUNT, count));
  try {
    localStorage.setItem(ACTIVE_COUNT_STORAGE_KEY, String(safeCount));
  } catch {
    // ignore
  }
}

/**
 * Load customized questions list (falls back to DEFAULT_QUESTIONS)
 */
export function getStoredQuestions(): Question[] {
  try {
    const raw = localStorage.getItem(QUESTIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length >= MIN_QUESTIONS_COUNT) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return DEFAULT_QUESTIONS;
}

/**
 * Get the currently active questions slice based on activeCount
 */
export function getActiveQuestions(): Question[] {
  const all = getStoredQuestions();
  const count = getActiveQuestionsCount();
  return all.slice(0, Math.min(count, all.length));
}

/**
 * Save full questions pool to localStorage
 */
export function saveStoredQuestions(questionsList: Question[]): void {
  try {
    localStorage.setItem(QUESTIONS_STORAGE_KEY, JSON.stringify(questionsList));
  } catch (err) {
    console.error('Failed to save questions to localStorage', err);
  }
}

/**
 * Reset questions back to default
 */
export function resetQuestionsToDefault(): void {
  try {
    localStorage.removeItem(QUESTIONS_STORAGE_KEY);
    localStorage.removeItem(ACTIVE_COUNT_STORAGE_KEY);
  } catch {
    // ignore
  }
}
