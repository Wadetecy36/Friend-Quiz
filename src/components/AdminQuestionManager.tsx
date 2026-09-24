import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Question,
  QuestionType,
  MIN_QUESTIONS_COUNT,
  MAX_QUESTIONS_COUNT,
} from '../lib/questions';
import { useQuestions } from '../hooks/useQuestions';
import { useDesignSystem } from '../context/DesignSystemContext';
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Edit3,
  X,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  FileQuestion,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface AdminQuestionManagerProps {
  onQuestionsUpdated: () => void;
}

const PRESET_IDEAS: Omit<Question, 'id'>[] = [
  {
    type: 'select',
    label: 'What is my favorite season of the year?',
    description: 'Weather and atmosphere preference.',
    options: ['Crisp Autumn / Fall', 'Warm Sun-drenched Summer', 'Fresh Blooming Spring', 'Cozy Snowy Winter'],
    correctAnswer: 'Crisp Autumn / Fall',
    explanation: 'Sweater weather, hot coffee, and cool breeze.',
  },
  {
    type: 'select',
    label: 'If I were trapped on a desert island, which one item would I bring?',
    description: 'Practical survival vs entertainment.',
    options: ['Multi-tool survival knife', 'Satellite phone / Solar charger', 'Acoustic guitar / Notebook', 'Endless supply of spicy ramen'],
    correctAnswer: 'Multi-tool survival knife',
    explanation: 'Practicality first!',
  },
  {
    type: 'text',
    label: 'What is my favorite sports team or athlete?',
    description: 'Or sport I get most hyped watching.',
    placeholder: 'Team name or athlete...',
    correctAnswer: 'Arsenal',
    acceptedAlternatives: ['arsenal', 'real madrid', 'lebron', 'curry', 'messi'],
    explanation: 'Passionate supporter through thick and thin.',
  },
  {
    type: 'scale',
    label: 'How easily do I get scared by horror movies? (1-10)',
    description: '1 = unbothered stone face, 10 = hiding behind pillows.',
    min: 1,
    max: 10,
    minLabel: 'Zero fear / Unbothered',
    maxLabel: 'Traumatized for weeks',
    correctAnswer: 4,
    acceptedAlternatives: ['3', '4', '5'],
    explanation: 'Enjoys suspense, barely flinches at jump scares.',
  },
  {
    type: 'select',
    label: 'What is my go-to pizza topping combination?',
    description: 'No boring slices allowed.',
    options: ['Spicy Pepperoni & Hot Honey', 'Margherita with fresh buffalo mozzarella', 'Prosciutto, Arugula & Truffle Oil', 'Classic BBQ Chicken & Red Onion'],
    correctAnswer: 'Spicy Pepperoni & Hot Honey',
    explanation: 'The sweet and spicy contrast is elite.',
  },
];

export const AdminQuestionManager: React.FC<AdminQuestionManagerProps> = ({
  onQuestionsUpdated,
}) => {
  const { theme } = useDesignSystem();
  const {
    questionsList,
    activeCount,
    isLoading: isHookLoading,
    error: hookError,
    setError: setHookError,
    saveQuestion,
    deleteQuestion,
    reorderQuestions,
    changeActiveCount,
    resetAllToDefaults,
  } = useQuestions();

  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [saveBanner, setSaveBanner] = useState(false);

  // In-app modals portaled to body (immune to any parent transform/clipping)
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [formValidationError, setFormValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state for creating / editing
  const [formLabel, setFormLabel] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formType, setFormType] = useState<QuestionType>('select');
  const [formOptions, setFormOptions] = useState<string[]>(['Option A', 'Option B', 'Option C', 'Option D']);
  const [formCorrectAnswer, setFormCorrectAnswer] = useState<string | number>('Option A');
  const [formAlternatives, setFormAlternatives] = useState('');
  const [formMin, setFormMin] = useState(1);
  const [formMax, setFormMax] = useState(10);
  const [formMinLabel, setFormMinLabel] = useState('Lowest');
  const [formMaxLabel, setFormMaxLabel] = useState('Highest');
  const [formExplanation, setFormExplanation] = useState('');
  const [newOptionInput, setNewOptionInput] = useState('');

  // Lock body scroll whenever ANY modal is active
  const isAnyModalOpen = Boolean(isCreating || editingQuestion || questionToDelete || showResetConfirm);
  useEffect(() => {
    if (isAnyModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isAnyModalOpen]);

  const triggerSaveNotification = () => {
    setSaveBanner(true);
    setTimeout(() => setSaveBanner(false), 2500);
  };

  const handleActiveCountChange = (newCount: number) => {
    changeActiveCount(newCount);
    triggerSaveNotification();
    onQuestionsUpdated();
  };

  const openCreateModal = () => {
    setEditingQuestion(null);
    setFormLabel('');
    setFormDescription('');
    setFormType('select');
    setFormOptions(['Option 1', 'Option 2', 'Option 3', 'Option 4']);
    setFormCorrectAnswer('Option 1');
    setFormAlternatives('');
    setFormMin(1);
    setFormMax(10);
    setFormMinLabel('Not at all');
    setFormMaxLabel('Extremely');
    setFormExplanation('');
    setFormValidationError(null);
    setIsCreating(true);
  };

  const openEditModal = (q: Question) => {
    setEditingQuestion(q);
    setFormLabel(q.label);
    setFormDescription(q.description || '');
    setFormType(q.type);
    setFormOptions(q.options ? [...q.options] : ['Option A', 'Option B', 'Option C']);
    setFormCorrectAnswer(q.correctAnswer ?? (q.options ? q.options[0] : ''));
    setFormAlternatives(q.acceptedAlternatives ? q.acceptedAlternatives.join(', ') : '');
    setFormMin(q.min ?? 1);
    setFormMax(q.max ?? 10);
    setFormMinLabel(q.minLabel || 'Lowest');
    setFormMaxLabel(q.maxLabel || 'Highest');
    setFormExplanation(q.explanation || '');
    setFormValidationError(null);
    setIsCreating(false);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormValidationError(null);

    if (!formLabel.trim()) {
      setFormValidationError('Please enter a question prompt.');
      return;
    }

    const cleanAlternatives = formAlternatives
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    let updatedQuestion: Question;

    if (editingQuestion) {
      updatedQuestion = {
        ...editingQuestion,
        label: formLabel.trim(),
        description: formDescription.trim() || undefined,
        type: formType,
        correctAnswer: formCorrectAnswer,
        explanation: formExplanation.trim() || undefined,
      };
    } else {
      updatedQuestion = {
        id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        label: formLabel.trim(),
        description: formDescription.trim() || undefined,
        type: formType,
        correctAnswer: formCorrectAnswer,
        explanation: formExplanation.trim() || undefined,
      };
    }

    if (formType === 'select') {
      const validOptions = formOptions.map((o) => o.trim()).filter(Boolean);
      if (validOptions.length < 2) {
        setFormValidationError('Please provide at least 2 choices for multiple choice.');
        return;
      }
      updatedQuestion.options = validOptions;
      if (!validOptions.includes(String(formCorrectAnswer))) {
        updatedQuestion.correctAnswer = validOptions[0];
      }
    } else if (formType === 'text') {
      updatedQuestion.placeholder = 'Type your answer...';
      updatedQuestion.acceptedAlternatives = cleanAlternatives;
      if (!String(formCorrectAnswer).trim()) {
        setFormValidationError('Please specify the official correct answer for this text question.');
        return;
      }
    } else if (formType === 'scale') {
      updatedQuestion.min = formMin;
      updatedQuestion.max = formMax;
      updatedQuestion.minLabel = formMinLabel;
      updatedQuestion.maxLabel = formMaxLabel;
      updatedQuestion.correctAnswer = Number(formCorrectAnswer);
      updatedQuestion.acceptedAlternatives = [
        String(Number(formCorrectAnswer) - 1),
        String(formCorrectAnswer),
        String(Number(formCorrectAnswer) + 1),
      ];
    }

    setIsSubmitting(true);
    try {
      const res = await saveQuestion(updatedQuestion, Boolean(editingQuestion));
      if (res.success) {
        setEditingQuestion(null);
        setIsCreating(false);
        triggerSaveNotification();
        onQuestionsUpdated();
      } else {
        setFormValidationError(res.error || 'Failed to save question');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const promptDeleteQuestion = (q: Question) => {
    setActionError(null);
    if (questionsList.length <= MIN_QUESTIONS_COUNT) {
      setActionError(`Cannot delete. The questionnaire requires a minimum of ${MIN_QUESTIONS_COUNT} questions.`);
      return;
    }
    setQuestionToDelete(q);
  };

  const confirmDeleteQuestion = async () => {
    if (!questionToDelete) return;
    setIsSubmitting(true);
    try {
      const res = await deleteQuestion(questionToDelete.id);
      if (res.success) {
        setQuestionToDelete(null);
        triggerSaveNotification();
        onQuestionsUpdated();
      } else {
        setActionError(res.error || 'Failed to delete question');
        setQuestionToDelete(null);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    reorderQuestions(index, direction);
    triggerSaveNotification();
    onQuestionsUpdated();
  };

  const handleAddPreset = async (preset: Omit<Question, 'id'>) => {
    if (questionsList.length >= MAX_QUESTIONS_COUNT) {
      setActionError(`Maximum limit of ${MAX_QUESTIONS_COUNT} questions reached.`);
      return;
    }

    const newQ: Question = {
      ...preset,
      id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    };

    const res = await saveQuestion(newQ, false);
    if (res.success) {
      setShowPresets(false);
      triggerSaveNotification();
      onQuestionsUpdated();
    } else {
      setActionError(res.error || 'Failed to add preset');
    }
  };

  const confirmResetToDefault = () => {
    resetAllToDefaults();
    setShowResetConfirm(false);
    triggerSaveNotification();
    onQuestionsUpdated();
  };

  const handleAddOption = () => {
    const clean = newOptionInput.trim();
    if (!clean) return;
    if (formOptions.includes(clean)) {
      setFormValidationError('This option already exists.');
      return;
    }
    setFormOptions([...formOptions, clean]);
    setNewOptionInput('');
  };

  const handleRemoveOption = (optToRemove: string) => {
    if (formOptions.length <= 2) {
      setFormValidationError('Multiple choice questions must have at least 2 options.');
      return;
    }
    const updated = formOptions.filter((o) => o !== optToRemove);
    setFormOptions(updated);
    if (formCorrectAnswer === optToRemove) {
      setFormCorrectAnswer(updated[0]);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Save Notification */}
      {saveBanner && (
        <div className="fixed top-20 right-6 z-50 p-3.5 bg-orange-600 text-white rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2 border border-orange-400">
          <CheckCircle2 className="w-4 h-4 text-amber-300" />
          <span>Questions & quiz length saved!</span>
        </div>
      )}

      {/* Dismissible Error Banner */}
      {(actionError || hookError) && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{actionError || hookError}</span>
          </div>
          <button
            onClick={() => {
              setActionError(null);
              setHookError(null);
            }}
            className="p-1 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Control Banner: Quiz Length Stepper & Actions */}
      <div
        className="p-6 sm:p-8 rounded-2xl border shadow-lg space-y-5 text-left"
        style={{
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        }}
      >
        <div
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b"
          style={{ borderColor: theme.colors.borderSecondary }}
        >
          <div className="space-y-1">
            <span className="tag-butter">Quiz Customizer</span>
            <h2
              className="text-xl sm:text-2xl font-bold mt-1 tracking-tight"
              style={{
                fontFamily: theme.typography.displayFont,
                color: theme.colors.textPrimary,
              }}
            >
              Active Quiz Length:{' '}
              <span className="text-orange-400">{activeCount} Questions</span>
            </h2>
            <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
              Participants will answer the first <strong>{activeCount}</strong> questions in your bank ({MIN_QUESTIONS_COUNT} min, {MAX_QUESTIONS_COUNT} max).
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={openCreateModal}
              className="btn-primary text-xs py-2.5 px-4 font-bold"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Question</span>
            </button>

            <button
              onClick={() => setShowPresets(!showPresets)}
              className="btn-secondary text-xs py-2.5 px-3.5"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Ideas Library</span>
            </button>
          </div>
        </div>

        {/* Question Count Stepper & Quick Presets */}
        <div className="space-y-3">
          <div
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border"
            style={{
              backgroundColor: theme.colors.surfaceElevated,
              borderColor: theme.colors.borderSecondary,
            }}
          >
            <div className="text-xs">
              <span
                className="font-bold block text-sm"
                style={{ color: theme.colors.textPrimary }}
              >
                Set Quiz Size ({MIN_QUESTIONS_COUNT} – {MAX_QUESTIONS_COUNT}):
              </span>
              <span className="text-xs" style={{ color: theme.colors.textSecondary }}>
                Total questions in your bank: {questionsList.length}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="range"
                min={MIN_QUESTIONS_COUNT}
                max={Math.min(MAX_QUESTIONS_COUNT, questionsList.length)}
                value={activeCount}
                onChange={(e) => handleActiveCountChange(parseInt(e.target.value, 10))}
                className="w-32 sm:w-48 accent-orange-500 cursor-pointer"
              />
              <span
                className="font-mono font-bold text-sm text-orange-400 px-3 py-1 rounded-xl border"
                style={{
                  backgroundColor: theme.colors.surfaceSubtle,
                  borderColor: theme.colors.borderSecondary,
                }}
              >
                {activeCount}
              </span>
            </div>
          </div>

          {/* Quick preset buttons */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span style={{ color: theme.colors.textSecondary }}>Quick presets:</span>
            {[5, 8, 10, 12, 15, 20].map((num) => (
              <button
                key={num}
                disabled={num > questionsList.length}
                onClick={() => handleActiveCountChange(num)}
                className={`px-3 py-1 rounded-xl transition cursor-pointer text-xs font-bold border ${
                  activeCount === num
                    ? 'bg-orange-600 text-white border-orange-500 shadow-md'
                    : 'hover:border-orange-500/40 disabled:opacity-30 disabled:cursor-not-allowed'
                }`}
                style={{
                  backgroundColor: activeCount === num ? undefined : theme.colors.surfaceElevated,
                  borderColor: activeCount === num ? undefined : theme.colors.borderSecondary,
                  color: activeCount === num ? '#ffffff' : theme.colors.textPrimary,
                }}
              >
                {num} Qs
              </button>
            ))}

            <button
              onClick={() => setShowResetConfirm(true)}
              className="ml-auto text-xs flex items-center gap-1.5 cursor-pointer transition hover:text-orange-400"
              style={{ color: theme.colors.textSecondary }}
              title="Reset questions to Denzel's 20 default questions"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preset Ideas Drawer */}
      {showPresets && (
        <div
          className="p-6 rounded-2xl border shadow-lg space-y-4 text-left"
          style={{
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3
                className="font-bold text-sm"
                style={{ color: theme.colors.textPrimary }}
              >
                Preset Question Ideas (Click to Add to Bank):
              </h3>
            </div>
            <button
              onClick={() => setShowPresets(false)}
              className="p-1.5 rounded-lg border hover:border-orange-500/50 cursor-pointer"
              style={{
                backgroundColor: theme.colors.surfaceElevated,
                borderColor: theme.colors.borderSecondary,
                color: theme.colors.textSecondary,
              }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {PRESET_IDEAS.map((idea, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border space-y-2 flex flex-col justify-between"
                style={{
                  backgroundColor: theme.colors.surfaceElevated,
                  borderColor: theme.colors.borderSecondary,
                }}
              >
                <div>
                  <div
                    className="font-bold text-sm"
                    style={{ color: theme.colors.textPrimary }}
                  >
                    {idea.label}
                  </div>
                  <div
                    className="text-xs mt-0.5"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    {idea.description}
                  </div>
                  <div className="text-xs text-amber-400 font-semibold mt-1.5">
                    Correct: {String(idea.correctAnswer)}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-white/[0.06]">
                  <span className="font-mono text-[10px] uppercase font-bold text-orange-400">
                    {idea.type}
                  </span>
                  <button
                    onClick={() => handleAddPreset(idea)}
                    className="btn-secondary text-[11px] py-1.5 px-3"
                  >
                    <Plus className="w-3.5 h-3.5 text-orange-400" />
                    <span>Add to Bank</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Questions Bank List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3
            className="text-sm font-bold font-mono tracking-wider uppercase flex items-center gap-2"
            style={{ color: theme.colors.textSecondary }}
          >
            <span>Questions Bank ({questionsList.length} Total)</span>
          </h3>
          <span className="text-xs font-mono" style={{ color: theme.colors.textMuted }}>
            First {activeCount} active in live quiz
          </span>
        </div>

        {questionsList.map((q, index) => {
          const isActive = index < activeCount;
          return (
            <div
              key={q.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 ${
                isActive
                  ? 'border-orange-500/40 shadow-sm'
                  : 'opacity-70 border-white/[0.06]'
              }`}
              style={{
                backgroundColor: theme.colors.surface,
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3.5">
                {/* Number & Info */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-xl font-mono text-xs font-bold flex items-center justify-center shrink-0 border ${
                      isActive
                        ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                        : 'border-white/10'
                    }`}
                    style={{
                      backgroundColor: isActive ? undefined : theme.colors.surfaceElevated,
                      color: isActive ? undefined : theme.colors.textMuted,
                    }}
                  >
                    #{index + 1}
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="font-bold text-base"
                        style={{ color: theme.colors.textPrimary }}
                      >
                        {q.label}
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-white/10 bg-white/[0.04] text-stone-300 uppercase">
                        {q.type}
                      </span>
                      {isActive ? (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-500/40 bg-emerald-950/40 text-emerald-300">
                          Active in quiz
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-stone-700 bg-stone-900/60 text-stone-400">
                          Bank only
                        </span>
                      )}
                    </div>

                    {q.description && (
                      <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
                        {q.description}
                      </p>
                    )}

                    {/* Correct Answer Display */}
                    <div className="pt-1 text-xs flex items-center gap-2 flex-wrap">
                      <span style={{ color: theme.colors.textMuted }}>Official Correct:</span>
                      <span className="px-2.5 py-0.5 rounded-lg border border-emerald-500/40 bg-emerald-950/40 text-emerald-300 font-bold font-mono text-xs">
                        {String(q.correctAnswer ?? 'Not set')}
                      </span>
                      {q.explanation && (
                        <span className="text-xs italic" style={{ color: theme.colors.textSecondary }}>
                          ({q.explanation})
                        </span>
                      )}
                    </div>

                    {/* Options list if select */}
                    {q.type === 'select' && q.options && (
                      <div className="pt-1 flex flex-wrap gap-1.5 text-xs">
                        {q.options.map((opt) => (
                          <span
                            key={opt}
                            className={`px-2.5 py-0.5 rounded-lg text-xs font-mono border ${
                              String(q.correctAnswer) === opt
                                ? 'bg-orange-500/20 border-orange-500/40 text-orange-300 font-bold'
                                : 'border-white/10 text-stone-400'
                            }`}
                            style={{
                              backgroundColor: String(q.correctAnswer) === opt ? undefined : theme.colors.surfaceElevated,
                            }}
                          >
                            {opt}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Question Actions */}
                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-start">
                  <button
                    onClick={() => handleMove(index, 'up')}
                    disabled={index === 0}
                    className="p-2 rounded-xl border transition disabled:opacity-30 disabled:cursor-not-allowed hover:border-orange-500/40 cursor-pointer"
                    style={{
                      backgroundColor: theme.colors.surfaceElevated,
                      borderColor: theme.colors.borderSecondary,
                      color: theme.colors.textPrimary,
                    }}
                    title="Move up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleMove(index, 'down')}
                    disabled={index === questionsList.length - 1}
                    className="p-2 rounded-xl border transition disabled:opacity-30 disabled:cursor-not-allowed hover:border-orange-500/40 cursor-pointer"
                    style={{
                      backgroundColor: theme.colors.surfaceElevated,
                      borderColor: theme.colors.borderSecondary,
                      color: theme.colors.textPrimary,
                    }}
                    title="Move down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => openEditModal(q)}
                    className="p-2 rounded-xl border transition hover:border-orange-500/60 text-orange-400 cursor-pointer"
                    style={{
                      backgroundColor: theme.colors.surfaceElevated,
                      borderColor: theme.colors.borderSecondary,
                    }}
                    title="Edit question"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => promptDeleteQuestion(q)}
                    disabled={questionsList.length <= MIN_QUESTIONS_COUNT}
                    className="p-2 rounded-xl border border-rose-500/30 bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    title="Delete question"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* PORTAL MODAL: CREATE / EDIT QUESTION (DETACHED FROM PARENT TRANSFORMS)    */}
      {/* ========================================================================= */}
      {(isCreating || editingQuestion) &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] overflow-y-auto bg-black/80 backdrop-blur-sm p-3 sm:p-6"
            style={{ minHeight: '100vh', WebkitOverflowScrolling: 'touch' }}
            onClick={() => {
              if (!isSubmitting) {
                setIsCreating(false);
                setEditingQuestion(null);
              }
            }}
          >
            <div className="flex min-h-full items-center justify-center py-4">
              <div
                className="relative w-full max-w-xl rounded-2xl border shadow-2xl p-6 sm:p-8 space-y-5 text-left"
                style={{
                  backgroundColor: '#13171F',
                  borderColor: 'rgba(249, 115, 22, 0.4)',
                  boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.95)',
                  color: '#F1F5F9',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-md">
                      <FileQuestion className="w-5 h-5" />
                    </div>
                    <div>
                      <h3
                        className="text-lg sm:text-xl font-bold tracking-tight text-white"
                        style={{ fontFamily: theme.typography.displayFont }}
                      >
                        {editingQuestion ? 'Edit Question & Answer' : 'Create Custom Question'}
                      </h3>
                      <p className="text-xs text-stone-400">
                        {editingQuestion
                          ? 'Update question text and official answers'
                          : 'Add a new question to your active quiz bank'}
                      </p>
                    </div>
                  </div>
                  <button
                    disabled={isSubmitting}
                    onClick={() => {
                      setIsCreating(false);
                      setEditingQuestion(null);
                    }}
                    className="p-2 rounded-xl bg-white/[0.05] border border-white/10 hover:border-orange-500/50 text-stone-300 hover:text-white transition cursor-pointer disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Inline Validation Error Banner */}
                {formValidationError && (
                  <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{formValidationError}</span>
                  </div>
                )}

                <form onSubmit={handleSaveQuestion} className="space-y-4 text-xs text-left">
                  {/* Question Label */}
                  <div>
                    <label className="block text-stone-300 mb-1.5 font-bold text-xs">
                      Question Prompt <span className="text-orange-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formLabel}
                      onChange={(e) => setFormLabel(e.target.value)}
                      placeholder="e.g. What is my dream travel destination?"
                      className="w-full bg-[#1C222E] border border-white/10 rounded-xl px-3.5 py-2.5 text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    />
                  </div>

                  {/* Subtitle / Hint */}
                  <div>
                    <label className="block text-stone-300 mb-1.5 font-medium text-xs">
                      Description / Hint (Optional)
                    </label>
                    <input
                      type="text"
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="e.g. Think of somewhere warm with incredible food"
                      className="w-full bg-[#1C222E] border border-white/10 rounded-xl px-3.5 py-2.5 text-stone-100 placeholder-stone-500 text-xs focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    />
                  </div>

                  {/* Question Type */}
                  <div>
                    <label className="block text-stone-300 mb-1.5 font-bold text-xs">
                      Question Format / Type
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['select', 'text', 'scale'] as QuestionType[]).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => {
                            setFormType(t);
                            if (t === 'select' && formOptions.length > 0) {
                              setFormCorrectAnswer(formOptions[0]);
                            } else if (t === 'scale') {
                              setFormCorrectAnswer(8);
                            } else if (t === 'text') {
                              setFormCorrectAnswer('');
                            }
                          }}
                          className={`py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer border ${
                            formType === t
                              ? 'bg-orange-600 text-white border-orange-500 shadow-md'
                              : 'bg-[#1C222E] border-white/10 hover:border-orange-500/40 text-stone-300'
                          }`}
                        >
                          {t === 'select' ? 'Multiple Choice' : t === 'text' ? 'Open Text' : 'Rating Scale'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* TYPE: SELECT */}
                  {formType === 'select' && (
                    <div className="p-4 rounded-xl bg-[#1C222E] border border-white/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-stone-200 font-bold text-xs">
                          Answer Choices & Official Answer:
                        </label>
                        <span className="text-[11px] text-orange-400 font-mono">
                          Select radio to set correct
                        </span>
                      </div>

                      <div className="space-y-2">
                        {formOptions.map((opt, oIdx) => {
                          const isCorrect = String(formCorrectAnswer) === opt;
                          return (
                            <div
                              key={oIdx}
                              onClick={() => setFormCorrectAnswer(opt)}
                              className={`p-3 rounded-xl flex items-center justify-between gap-2 cursor-pointer transition border ${
                                isCorrect
                                  ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-200'
                                  : 'bg-[#13171F] border-white/5 hover:border-white/15 text-stone-200'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <input
                                  type="radio"
                                  name="correctAnswerSelect"
                                  checked={isCorrect}
                                  onChange={() => setFormCorrectAnswer(opt)}
                                  className="accent-emerald-500 cursor-pointer"
                                />
                                <span className="font-medium text-xs">{opt}</span>
                              </div>

                              <div className="flex items-center gap-2">
                                {isCorrect && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/40 bg-emerald-950/40 text-emerald-300 font-bold font-mono">
                                    Correct
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveOption(opt);
                                  }}
                                  className="p-1 text-stone-400 hover:text-rose-400 cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Add option input */}
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          value={newOptionInput}
                          onChange={(e) => setNewOptionInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddOption();
                            }
                          }}
                          placeholder="Add an option choice..."
                          className="flex-1 bg-[#13171F] border border-white/10 rounded-xl px-3 py-2 text-stone-200 text-xs focus:outline-none focus:border-orange-500"
                        />
                        <button
                          type="button"
                          onClick={handleAddOption}
                          className="px-3 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs cursor-pointer transition"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )}

                  {/* TYPE: TEXT */}
                  {formType === 'text' && (
                    <div className="p-4 rounded-xl bg-[#1C222E] border border-white/10 space-y-3">
                      <div>
                        <label className="block text-stone-300 mb-1 font-bold text-xs">
                          Official Correct Answer <span className="text-orange-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={String(formCorrectAnswer)}
                          onChange={(e) => setFormCorrectAnswer(e.target.value)}
                          placeholder="e.g. Kwame"
                          className="w-full bg-[#13171F] border border-white/10 rounded-xl px-3.5 py-2 text-stone-200 text-xs focus:outline-none focus:border-orange-500"
                        />
                      </div>

                      <div>
                        <label className="block text-stone-300 mb-1 font-medium text-xs">
                          Accepted Aliases / Nicknames (Comma-separated)
                        </label>
                        <input
                          type="text"
                          value={formAlternatives}
                          onChange={(e) => setFormAlternatives(e.target.value)}
                          placeholder="e.g. kwame, kofi, kwesi, denzel"
                          className="w-full bg-[#13171F] border border-white/10 rounded-xl px-3.5 py-2 text-stone-200 text-xs focus:outline-none focus:border-orange-500"
                        />
                        <span className="text-[11px] text-stone-400 mt-1 block">
                          Matches case-insensitively and allows common alternate spellings.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* TYPE: SCALE */}
                  {formType === 'scale' && (
                    <div className="p-4 rounded-xl bg-[#1C222E] border border-white/10 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-stone-300 mb-1 text-xs">Min Value</label>
                          <input
                            type="number"
                            value={formMin}
                            onChange={(e) => setFormMin(parseInt(e.target.value, 10))}
                            className="w-full bg-[#13171F] border border-white/10 rounded-xl px-3 py-2 text-stone-200 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-stone-300 mb-1 text-xs">Max Value</label>
                          <input
                            type="number"
                            value={formMax}
                            onChange={(e) => setFormMax(parseInt(e.target.value, 10))}
                            className="w-full bg-[#13171F] border border-white/10 rounded-xl px-3 py-2 text-stone-200 text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-stone-300 mb-1 text-xs font-bold">
                          Target Correct Rating (Numeric) <span className="text-orange-400">*</span>
                        </label>
                        <input
                          type="number"
                          min={formMin}
                          max={formMax}
                          value={Number(formCorrectAnswer)}
                          onChange={(e) => setFormCorrectAnswer(parseInt(e.target.value, 10))}
                          className="w-full bg-[#13171F] border border-white/10 rounded-xl px-3 py-2 text-stone-200 text-xs focus:outline-none focus:border-orange-500"
                        />
                        <span className="text-[11px] text-stone-400 mt-1 block">
                          Participants within ±1 point will be counted as correct.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Lore Explanation */}
                  <div>
                    <label className="block text-stone-300 mb-1 font-medium text-xs">
                      Fun Lore / Explanation (Shown in Results)
                    </label>
                    <input
                      type="text"
                      value={formExplanation}
                      onChange={(e) => setFormExplanation(e.target.value)}
                      placeholder="e.g. Because nothing beats fresh sushi at 2 AM!"
                      className="w-full bg-[#1C222E] border border-white/10 rounded-xl px-3.5 py-2 text-stone-200 text-xs focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  {/* Submit / Cancel Buttons */}
                  <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => {
                        setIsCreating(false);
                        setEditingQuestion(null);
                      }}
                      className="px-4 py-2.5 rounded-xl border border-white/10 bg-[#1C222E] text-stone-300 hover:text-white font-medium text-xs cursor-pointer transition disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary text-xs py-2.5 px-5 font-bold shadow-lg flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <span>{editingQuestion ? 'Update Question' : 'Save Question'}</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* ========================================================================= */}
      {/* PORTAL MODAL: DELETE QUESTION (DETACHED FROM PARENT TRANSFORMS)           */}
      {/* ========================================================================= */}
      {questionToDelete &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] overflow-y-auto bg-black/80 backdrop-blur-sm p-4"
            style={{ minHeight: '100vh', WebkitOverflowScrolling: 'touch' }}
            onClick={() => !isSubmitting && setQuestionToDelete(null)}
          >
            <div className="flex min-h-full items-center justify-center py-4">
              <div
                className="relative w-full max-w-md p-6 rounded-2xl border shadow-2xl space-y-4 text-left"
                style={{
                  backgroundColor: '#13171F',
                  borderColor: 'rgba(239, 68, 68, 0.4)',
                  boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.95)',
                  color: '#F1F5F9',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Delete Question?</h3>
                    <p className="text-xs text-stone-400">This action cannot be undone.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#1C222E] border border-white/10 text-xs space-y-1">
                  <span className="font-bold text-stone-300 block">Question:</span>
                  <p className="text-stone-300 italic">"{questionToDelete.label}"</p>
                </div>

                <p className="text-xs text-stone-400 leading-relaxed">
                  Are you sure you want to remove this question from your quiz bank? If it is currently active, future participants will no longer see it.
                </p>

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setQuestionToDelete(null)}
                    className="px-4 py-2 rounded-xl bg-[#1C222E] border border-white/10 text-stone-300 hover:text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={confirmDeleteQuestion}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Yes, Delete Question</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* ========================================================================= */}
      {/* PORTAL MODAL: RESET DEFAULTS (DETACHED FROM PARENT TRANSFORMS)            */}
      {/* ========================================================================= */}
      {showResetConfirm &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] overflow-y-auto bg-black/80 backdrop-blur-sm p-4"
            style={{ minHeight: '100vh', WebkitOverflowScrolling: 'touch' }}
            onClick={() => setShowResetConfirm(false)}
          >
            <div className="flex min-h-full items-center justify-center py-4">
              <div
                className="relative w-full max-w-md p-6 rounded-2xl border shadow-2xl space-y-4 text-left"
                style={{
                  backgroundColor: '#13171F',
                  borderColor: 'rgba(249, 115, 22, 0.4)',
                  boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.95)',
                  color: '#F1F5F9',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-400 flex items-center justify-center shrink-0">
                    <RotateCcw className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Reset to Default Questions?</h3>
                    <p className="text-xs text-stone-400">Restore Denzel's original 20 questions</p>
                  </div>
                </div>

                <p className="text-xs text-stone-300 leading-relaxed">
                  This will restore the original default questions and reset the active quiz length to 12. Any custom questions you added will be reverted.
                </p>

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(false)}
                    className="px-4 py-2 rounded-xl bg-[#1C222E] border border-white/10 text-stone-300 hover:text-white text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmResetToDefault}
                    className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-lg transition cursor-pointer flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Yes, Reset Defaults</span>
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
