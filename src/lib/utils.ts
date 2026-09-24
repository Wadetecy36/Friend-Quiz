import { Question } from './questions';

export interface ResponseRecord {
  id: string;
  participant_name: string;
  answers: Record<string, string | number>;
  created_at: string;
  updated_at: string;
}

/**
 * Standard debounce implementation
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return function (...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Calculates how many questions are answered and percentage
 */
export function calculateCompletion(
  answers: Record<string, unknown> | null | undefined,
  totalQuestions: number
): { count: number; percentage: number } {
  if (!answers || typeof answers !== 'object' || totalQuestions <= 0) {
    return { count: 0, percentage: 0 };
  }

  const answeredCount = Object.entries(answers).filter(([_, val]) => {
    if (val === null || val === undefined) return false;
    if (typeof val === 'string') return val.trim().length > 0;
    if (typeof val === 'number') return true;
    return false;
  }).length;

  const percentage = Math.min(100, Math.round((answeredCount / totalQuestions) * 100));
  return { count: answeredCount, percentage };
}

/**
 * Formats ISO date string into readable format
 */
export function formatDate(dateString: string | undefined): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(d);
  } catch {
    return dateString;
  }
}

/**
 * Safe CSV field escaper
 */
function escapeCSV(value: unknown): string {
  if (value === null || value === undefined) return '""';
  const str = String(value);
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}

/**
 * Deterministic avatar generator based on participant name
 */
export const AVATAR_OPTIONS = [
  '⚡', '🦊', '🚀', '🔥', '💎', '🎮', '🥑', '🎯',
  '🎧', '👾', '🌟', '🦄', '☕', '🍕', '🧠', '🕶️'
];

export function getParticipantAvatar(name: string): string {
  if (!name) return '👤';
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_OPTIONS.length;
  return AVATAR_OPTIONS[index];
}

/**
 * Generates and triggers browser download of responses as CSV
 */
export function exportToCSV(responses: ResponseRecord[], questionsList: Question[]): void {
  if (!responses || responses.length === 0) {
    alert('No response data available to export.');
    return;
  }

  // Define headers
  const headers = [
    'Response ID',
    'Participant Name',
    'Completion %',
    'Answered Count',
    'Started At',
    'Last Updated At',
    ...questionsList.map((q, idx) => `Q${idx + 1}: ${q.label}`),
  ];

  const rows = responses.map((res) => {
    const { count, percentage } = calculateCompletion(res.answers, questionsList.length);
    const questionAnswers = questionsList.map((q) => {
      const ans = res.answers ? res.answers[q.id] : undefined;
      return ans !== undefined && ans !== null ? ans : '';
    });

    return [
      escapeCSV(res.id),
      escapeCSV(res.participant_name),
      escapeCSV(`${percentage}%`),
      escapeCSV(`${count}/${questionsList.length}`),
      escapeCSV(formatDate(res.created_at)),
      escapeCSV(formatDate(res.updated_at)),
      ...questionAnswers.map((a) => escapeCSV(a)),
    ].join(',');
  });

  const csvContent = [headers.map(escapeCSV).join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const timestamp = new Date().toISOString().slice(0, 10);
  link.setAttribute('download', `questionnaire_responses_${timestamp}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
