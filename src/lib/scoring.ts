import { questions, Question, getActiveQuestions } from './questions';
import { ResponseRecord } from './utils';

export interface QuestionKey {
  questionId: string;
  correctAnswer: string | number;
  acceptedAlternatives?: string[];
  explanation?: string;
}

export const DEFAULT_ANSWER_KEY: Record<string, QuestionKey> = {
  q1: {
    questionId: 'q1',
    correctAnswer: 'Kwame',
    acceptedAlternatives: ['kwame', 'kofi', 'mensah', 'kweku', 'denzel', 'denzel kwame'],
    explanation: 'Denzel Kwame Mensah',
  },
  q2: {
    questionId: 'q2',
    correctAnswer: 'Fresh Sushi & Spicy Ramen',
    explanation: 'Cannot resist fresh salmon nigiri and rich tonkotsu broth!',
  },
  q3: {
    questionId: 'q3',
    correctAnswer: 10,
    acceptedAlternatives: ['9', '10'],
    explanation: 'Self-proclaimed mind readers only!',
  },
  q4: {
    questionId: 'q4',
    correctAnswer: 'Iced Oat Milk Latte / Flat White',
    explanation: 'Double espresso with silky creamy oat milk is non-negotiable.',
  },
  q5: {
    questionId: 'q5',
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
  q6: {
    questionId: 'q6',
    correctAnswer: 'Nowhere to be, nothing to do',
    explanation: 'A zero-obligation Saturday morning with good coffee and chill music.',
  },
  q7: {
    questionId: 'q7',
    correctAnswer: 'Electric Metropolis (Tokyo, Seoul, NYC)',
    explanation: 'High energy, incredible neon streetscapes, and 2 AM food runs.',
  },
  q8: {
    questionId: 'q8',
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
  q9: {
    questionId: 'q9',
    correctAnswer: 3,
    acceptedAlternatives: ['2', '3', '4'],
    explanation: 'Usually reliable and punctual, barring unpredictable traffic!',
  },
  q10: {
    questionId: 'q10',
    correctAnswer: 'Cooking a relaxed gourmet meal with playlist on',
    explanation: 'Chopping garlic, simmering spices, and turning on soul beats.',
  },
  q11: {
    questionId: 'q11',
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
  q12: {
    questionId: 'q12',
    correctAnswer: 9,
    acceptedAlternatives: ['8', '9', '10'],
    explanation: 'Fast reflex, tactical stealth, and great cardio.',
  },
};

const ANSWER_KEY_STORAGE_KEY = 'denzel_quiz_answer_key_v1';

/**
 * Retrieve current answer key (persisted custom or default)
 */
export function getStoredAnswerKey(): Record<string, QuestionKey> {
  try {
    const raw = localStorage.getItem(ANSWER_KEY_STORAGE_KEY);
    if (!raw) return DEFAULT_ANSWER_KEY;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_ANSWER_KEY, ...parsed };
  } catch {
    return DEFAULT_ANSWER_KEY;
  }
}

/**
 * Save customized answer key
 */
export function saveCustomAnswerKey(customKey: Record<string, Partial<QuestionKey>>): void {
  try {
    const current = getStoredAnswerKey();
    const updated = { ...current };
    Object.entries(customKey).forEach(([qid, val]) => {
      if (updated[qid]) {
        updated[qid] = { ...updated[qid], ...val };
      }
    });
    localStorage.setItem(ANSWER_KEY_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save custom answer key', err);
  }
}

/**
 * Reset answer key to defaults
 */
export function resetAnswerKey(): void {
  localStorage.removeItem(ANSWER_KEY_STORAGE_KEY);
}

export interface QuestionResult {
  questionId: string;
  label: string;
  type: string;
  userAnswer: string | number | undefined;
  correctAnswer: string | number;
  isAnswered: boolean;
  isCorrect: boolean;
  explanation?: string;
}

export interface ParticipantScore {
  id: string;
  participant_name: string;
  created_at: string;
  updated_at: string;
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  wrongCount: number;
  scorePercent: number;
  isAllCorrect: boolean;
  hasMistakes: boolean;
  results: QuestionResult[];
  wrongResults: QuestionResult[];
  roastTitle: string;
  roastDescription: string;
}

/**
 * Helper to test if a participant answer matches the answer key
 */
export function checkIsCorrect(
  userAns: string | number | undefined,
  key: QuestionKey,
  q: Question
): boolean {
  if (userAns === undefined || userAns === null) return false;
  const strUser = String(userAns).trim();
  if (!strUser) return false;

  const strCorrect = String(key.correctAnswer).trim();

  // 1. Direct exact match
  if (strUser.toLowerCase() === strCorrect.toLowerCase()) {
    return true;
  }

  // 2. Select option match
  if (q.type === 'select') {
    return strUser.toLowerCase() === strCorrect.toLowerCase();
  }

  // 3. Scale match: check if within accepted tolerance (e.g. within 1 point if numeric)
  if (q.type === 'scale') {
    const numUser = Number(userAns);
    const numCorrect = Number(key.correctAnswer);
    if (!isNaN(numUser) && !isNaN(numCorrect)) {
      if (key.acceptedAlternatives && key.acceptedAlternatives.length > 0) {
        if (key.acceptedAlternatives.some((alt) => String(alt).trim() === strUser)) {
          return true;
        }
      }
      return Math.abs(numUser - numCorrect) <= 1;
    }
  }

  // 4. Text question match (fuzzy substring or alternatives)
  if (q.type === 'text') {
    const cleanUser = strUser.toLowerCase();
    const cleanCorrect = strCorrect.toLowerCase();

    if (cleanCorrect && (cleanUser.includes(cleanCorrect) || cleanCorrect.includes(cleanUser))) {
      return true;
    }

    if (key.acceptedAlternatives && key.acceptedAlternatives.length > 0) {
      for (const alt of key.acceptedAlternatives) {
        const cleanAlt = alt.toLowerCase().trim();
        if (cleanAlt && (cleanUser.includes(cleanAlt) || cleanAlt.includes(cleanUser))) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Generate funny roast based on wrong question count and total questions
 */
function getRoast(wrongCount: number, total: number): { title: string; description: string } {
  if (wrongCount === 0) {
    return {
      title: `👑 Soulmate Status (${total}/${total})`,
      description: 'Zero mistakes. You genuinely know Denzel better than Denzel knows himself!',
    };
  }
  const wrongPercent = (wrongCount / total) * 100;
  if (wrongCount === 1) {
    return {
      title: '🤏 Heartbreakingly Close',
      description: `Only 1 wrong answer out of ${total}! You almost made the 100% Club, just tripped on the fine print.`,
    };
  }
  if (wrongPercent <= 25) {
    return {
      title: '🤏 High-Tier Bestie',
      description: `Only ${wrongCount} wrong out of ${total}! Impressive knowledge.`,
    };
  }
  if (wrongPercent <= 50) {
    return {
      title: '🤝 Certified Acquaintance',
      description: `${wrongCount} wrong answers out of ${total}. You know the basics, but there are deeper secrets yet to learn.`,
    };
  }
  if (wrongPercent <= 75) {
    return {
      title: '📚 Needs Remedial Studying',
      description: `${wrongCount} wrong out of ${total}! Have you been paying attention at all?!`,
    };
  }
  return {
    title: '🚨 Total Stranger Alert',
    description: `All or nearly all ${total} questions wrong! Did you answer these with your eyes closed in a moving elevator?`,
  };
}

/**
 * Score a single participant response record
 */
export function scoreResponse(
  record: ResponseRecord,
  questionsList: Question[] = getActiveQuestions(),
  answerKey: Record<string, QuestionKey> = getStoredAnswerKey()
): ParticipantScore {
  const results: QuestionResult[] = [];
  let correctCount = 0;
  let answeredCount = 0;

  for (const q of questionsList) {
    const fallbackKey = answerKey[q.id] || {
      questionId: q.id,
      correctAnswer: '',
    };

    const key: QuestionKey = {
      questionId: q.id,
      correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : fallbackKey.correctAnswer,
      acceptedAlternatives: q.acceptedAlternatives || fallbackKey.acceptedAlternatives,
      explanation: q.explanation || fallbackKey.explanation,
    };

    const userVal = record.answers?.[q.id];
    const isAnswered =
      userVal !== undefined && userVal !== null && String(userVal).trim() !== '';

    if (isAnswered) answeredCount++;

    const isCorrect = isAnswered && checkIsCorrect(userVal, key, q);
    if (isCorrect) correctCount++;

    results.push({
      questionId: q.id,
      label: q.label,
      type: q.type,
      userAnswer: userVal,
      correctAnswer: key.correctAnswer,
      isAnswered,
      isCorrect,
      explanation: key.explanation,
    });
  }

  const totalQuestions = questionsList.length;
  const wrongCount = totalQuestions - correctCount;
  const scorePercent = Math.round((correctCount / totalQuestions) * 100);
  const isAllCorrect = correctCount === totalQuestions;
  const hasMistakes = wrongCount > 0;
  const wrongResults = results.filter((r) => !r.isCorrect);

  const { title: roastTitle, description: roastDescription } = getRoast(
    wrongCount,
    totalQuestions
  );

  return {
    id: record.id,
    participant_name: record.participant_name,
    created_at: record.created_at,
    updated_at: record.updated_at,
    totalQuestions,
    answeredCount,
    correctCount,
    wrongCount,
    scorePercent,
    isAllCorrect,
    hasMistakes,
    results,
    wrongResults,
    roastTitle,
    roastDescription,
  };
}

/**
 * Grade all responses and generate split leaderboard rankings:
 * 1. allCorrectRanking: Participants with 100% (or top scorers)
 * 2. questionsWrongRanking: Participants who got questions wrong (ranked by most mistakes)
 */
export function calculateLeaderboards(
  records: ResponseRecord[],
  questionsList: Question[] = getActiveQuestions(),
  answerKey: Record<string, QuestionKey> = getStoredAnswerKey()
): {
  allScores: ParticipantScore[];
  allCorrectScores: ParticipantScore[];
  questionsWrongScores: ParticipantScore[];
  topContenders: ParticipantScore[];
} {
  const scored = records.map((r) => scoreResponse(r, questionsList, answerKey));

  // Overall sorted by highest score, then earliest creation
  const allScores = [...scored].sort((a, b) => {
    if (b.correctCount !== a.correctCount) {
      return b.correctCount - a.correctCount;
    }
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  // Ranking 1: People who got ALL questions correct (100%)
  const allCorrectScores = allScores.filter((s) => s.isAllCorrect);

  // If no one has 100% yet, top contenders who are closest (e.g. 75%+ right)
  const minThreshold = Math.max(3, Math.floor(questionsList.length * 0.75));
  const topContenders = allScores.filter(
    (s) => !s.isAllCorrect && s.correctCount >= minThreshold
  );

  // Ranking 2: People who got questions wrong (ranked by most wrong questions first)
  const questionsWrongScores = [...scored]
    .filter((s) => s.wrongCount > 0)
    .sort((a, b) => {
      // Most wrong questions first
      if (b.wrongCount !== a.wrongCount) {
        return b.wrongCount - a.wrongCount;
      }
      // If same wrong count, lowest percentage, then earliest date
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });

  return {
    allScores,
    allCorrectScores,
    questionsWrongScores,
    topContenders,
  };
}
