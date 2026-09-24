import React, { useState } from 'react';
import {
  Question,
  QuestionType,
  MIN_QUESTIONS_COUNT,
  MAX_QUESTIONS_COUNT,
  DEFAULT_QUESTIONS,
  getActiveQuestionsCount,
  setActiveQuestionsCount,
  getStoredQuestions,
  saveStoredQuestions,
  resetQuestionsToDefault,
} from '../lib/questions';
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Edit3,
  X,
  Sliders,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  ListOrdered,
  FileQuestion,
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
  const [questionsList, setQuestionsList] = useState<Question[]>(getStoredQuestions());
  const [activeCount, setActiveCount] = useState<number>(getActiveQuestionsCount());
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [saveBanner, setSaveBanner] = useState(false);

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

  const triggerSaveNotification = () => {
    setSaveBanner(true);
    setTimeout(() => setSaveBanner(false), 2500);
  };

  const handleActiveCountChange = (newCount: number) => {
    const clamped = Math.max(MIN_QUESTIONS_COUNT, Math.min(MAX_QUESTIONS_COUNT, newCount));
    setActiveCount(clamped);
    setActiveQuestionsCount(clamped);
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
    setIsCreating(false);
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formLabel.trim()) {
      alert('Please enter a question prompt.');
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
        alert('Please provide at least 2 options for multiple choice.');
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
        alert('Please specify the official correct answer for this text question.');
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

    let newList: Question[];
    if (editingQuestion) {
      newList = questionsList.map((q) => (q.id === editingQuestion.id ? updatedQuestion : q));
    } else {
      newList = [...questionsList, updatedQuestion];
      if (newList.length <= MAX_QUESTIONS_COUNT && activeCount < newList.length) {
        setActiveCount(newList.length);
        setActiveQuestionsCount(newList.length);
      }
    }

    setQuestionsList(newList);
    saveStoredQuestions(newList);
    setEditingQuestion(null);
    setIsCreating(false);
    triggerSaveNotification();
    onQuestionsUpdated();
  };

  const handleDelete = (id: string, label: string) => {
    if (questionsList.length <= MIN_QUESTIONS_COUNT) {
      alert(`Cannot delete. The questionnaire requires a minimum of ${MIN_QUESTIONS_COUNT} questions.`);
      return;
    }

    if (!confirm(`Delete question: "${label}"?`)) return;

    const newList = questionsList.filter((q) => q.id !== id);
    setQuestionsList(newList);
    saveStoredQuestions(newList);

    if (activeCount > newList.length) {
      const nextCount = Math.max(MIN_QUESTIONS_COUNT, newList.length);
      setActiveCount(nextCount);
      setActiveQuestionsCount(nextCount);
    }

    triggerSaveNotification();
    onQuestionsUpdated();
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= questionsList.length) return;

    const copy = [...questionsList];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;

    setQuestionsList(copy);
    saveStoredQuestions(copy);
    triggerSaveNotification();
    onQuestionsUpdated();
  };

  const handleAddPreset = (preset: Omit<Question, 'id'>) => {
    if (questionsList.length >= MAX_QUESTIONS_COUNT) {
      alert(`Maximum of ${MAX_QUESTIONS_COUNT} questions reached.`);
      return;
    }

    const newQ: Question = {
      ...preset,
      id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    };

    const updated = [...questionsList, newQ];
    setQuestionsList(updated);
    saveStoredQuestions(updated);
    setShowPresets(false);
    triggerSaveNotification();
    onQuestionsUpdated();
  };

  const handleResetToDefault = () => {
    if (confirm('Reset questions back to Denzel’s original 20 default questions? All custom additions will be reverted.')) {
      resetQuestionsToDefault();
      setQuestionsList(DEFAULT_QUESTIONS);
      setActiveCount(12);
      setActiveQuestionsCount(12);
      triggerSaveNotification();
      onQuestionsUpdated();
    }
  };

  const handleAddOption = () => {
    const clean = newOptionInput.trim();
    if (!clean) return;
    if (formOptions.includes(clean)) {
      alert('This option already exists.');
      return;
    }
    setFormOptions([...formOptions, clean]);
    setNewOptionInput('');
  };

  const handleRemoveOption = (optToRemove: string) => {
    if (formOptions.length <= 2) {
      alert('Must have at least 2 options.');
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
        <div className="fixed top-20 right-6 z-50 p-3.5 bg-[#FF6B4A] text-white rounded-[20px] shadow-[0_4px_20px_rgba(255,107,74,0.4)] text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#FFD35C]" />
          <span>Questions & quiz length saved!</span>
        </div>
      )}

      {/* Control Banner: Quiz Length Stepper & Actions */}
      <div className="plum-card soft-glow p-6 sm:p-8 space-y-5 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
          <div className="space-y-1">
            <span className="tag-butter">
              Quiz Customizer
            </span>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-[#FBF4EA] mt-1">
              Active Quiz Length: <span className="text-[#FFD35C]">{activeCount} Questions</span>
            </h2>
            <p className="text-xs text-[#B9A8C9]">
              Participants will answer the first <strong>{activeCount}</strong> questions in your bank ({MIN_QUESTIONS_COUNT} min, {MAX_QUESTIONS_COUNT} max).
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={openCreateModal}
              className="btn-primary text-xs py-2.5 px-4"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Question</span>
            </button>

            <button
              onClick={() => setShowPresets(!showPresets)}
              className="btn-secondary text-xs py-2.5 px-3.5"
            >
              <Sparkles className="w-4 h-4 text-[#FFD35C]" />
              <span>Ideas Library</span>
            </button>
          </div>
        </div>

        {/* Question Count Stepper & Quick Presets */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/[0.04] p-4 rounded-[20px]">
            <div className="text-xs text-[#FBF4EA]">
              <span className="font-semibold block">Set Quiz Size (5 – 20):</span>
              <span className="text-xs text-[#B9A8C9]">
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
                className="w-32 sm:w-48 accent-[#FF6B4A] cursor-pointer"
              />
              <span className="font-display font-bold text-sm text-[#FFD35C] px-3 py-1 bg-white/[0.08] rounded-[12px]">
                {activeCount}
              </span>
            </div>
          </div>

          {/* Quick preset buttons */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-[#8C789B]">Quick presets:</span>
            {[5, 8, 10, 12, 15, 20].map((num) => (
              <button
                key={num}
                disabled={num > questionsList.length}
                onClick={() => handleActiveCountChange(num)}
                className={`px-3 py-1 rounded-[12px] transition cursor-pointer text-xs font-medium ${
                  activeCount === num
                    ? 'bg-[#FF6B4A] text-white shadow-[0_2px_10px_rgba(255,107,74,0.3)]'
                    : 'bg-white/[0.05] hover:bg-white/[0.1] text-[#B9A8C9] disabled:opacity-40 disabled:cursor-not-allowed'
                }`}
              >
                {num} Qs
              </button>
            ))}

            <button
              onClick={handleResetToDefault}
              className="ml-auto text-xs text-[#B9A8C9] hover:text-[#FF6B4A] flex items-center gap-1 cursor-pointer transition"
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
        <div className="plum-card p-6 space-y-4 text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FFD35C]" />
              <h3 className="font-display font-bold text-sm text-[#FBF4EA]">
                Preset Question Ideas (Click to Add):
              </h3>
            </div>
            <button
              onClick={() => setShowPresets(false)}
              className="btn-secondary p-1.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {PRESET_IDEAS.map((idea, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-[18px] bg-white/[0.04] space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="font-semibold text-[#FBF4EA]">{idea.label}</div>
                  <div className="text-xs text-[#B9A8C9]">{idea.description}</div>
                  <div className="text-xs text-[#FFD35C] font-medium mt-1">
                    Correct: {String(idea.correctAnswer)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleAddPreset(idea)}
                  className="mt-2 w-full py-2 px-3 rounded-[12px] bg-white/[0.08] hover:bg-[#FF6B4A] hover:text-white text-[#FBF4EA] font-medium text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Add to Quiz
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Question Cards List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-display font-bold text-base text-[#FBF4EA] flex items-center gap-2">
            <ListOrdered className="w-4 h-4 text-[#FFD35C]" />
            Questions Ordered List ({questionsList.length} Total)
          </h3>
          <span className="text-xs text-[#B9A8C9]">
            Top {activeCount} active in quiz
          </span>
        </div>

        {questionsList.map((q, index) => {
          const isActive = index < activeCount;

          return (
            <div
              key={q.id}
              className={`plum-card p-5 transition-colors ${
                isActive ? 'bg-[#241533]' : 'bg-[#1C1027] opacity-65'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5 min-w-0">
                  {/* Order Number Badge */}
                  <div
                    className={`w-9 h-9 rounded-[14px] flex items-center justify-center font-display font-bold text-sm shrink-0 ${
                      isActive ? 'avatar-gradient text-[#241533]' : 'bg-white/[0.08] text-[#8C789B]'
                    }`}
                  >
                    #{index + 1}
                  </div>

                  <div className="min-w-0 space-y-1.5 text-left">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display font-bold text-base text-[#FBF4EA]">
                        {q.label}
                      </span>
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/[0.08] text-[#B9A8C9] uppercase">
                        {q.type}
                      </span>
                      {isActive ? (
                        <span className="tag-butter text-[11px] py-0.5 px-2">
                          Active in quiz
                        </span>
                      ) : (
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/[0.05] text-[#8C789B]">
                          Bank only
                        </span>
                      )}
                    </div>

                    {q.description && (
                      <p className="text-xs text-[#B9A8C9]">{q.description}</p>
                    )}

                    {/* Correct Answer Display */}
                    <div className="pt-1 text-xs flex items-center gap-2 flex-wrap">
                      <span className="text-[#8C789B]">Official Correct:</span>
                      <span className="px-2 py-0.5 rounded-[10px] bg-emerald-500/20 text-emerald-200 font-semibold">
                        {String(q.correctAnswer ?? 'Not set')}
                      </span>
                      {q.explanation && (
                        <span className="text-xs text-[#8C789B] italic">
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
                            className={`px-2.5 py-0.5 rounded-[10px] text-[11px] ${
                              String(q.correctAnswer) === opt
                                ? 'bg-[#FFD35C]/20 text-[#FFD35C] font-semibold'
                                : 'bg-white/[0.04] text-[#B9A8C9]'
                            }`}
                          >
                            {opt}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Question Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleMove(index, 'up')}
                    disabled={index === 0}
                    className="btn-secondary p-2 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleMove(index, 'down')}
                    disabled={index === questionsList.length - 1}
                    className="btn-secondary p-2 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => openEditModal(q)}
                    className="btn-secondary p-2"
                    title="Edit question"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(q.id, q.label)}
                    disabled={questionsList.length <= MIN_QUESTIONS_COUNT}
                    className="p-2 rounded-[14px] bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 disabled:opacity-30 disabled:cursor-not-allowed"
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

      {/* Create / Edit Question Modal */}
      {(isCreating || editingQuestion) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="plum-card soft-glow max-w-xl w-full p-7 sm:p-9 max-h-[90vh] overflow-y-auto space-y-5 text-left">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 avatar-gradient text-[#241533]">
                  <FileQuestion className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-display font-bold text-[#FBF4EA]">
                  {editingQuestion ? 'Edit Question & Answer' : 'Create Custom Question'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setEditingQuestion(null);
                }}
                className="btn-secondary p-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4 text-xs text-left">
              {/* Question Label */}
              <div>
                <label className="block text-[#B9A8C9] mb-1.5 font-medium">
                  Question Prompt *
                </label>
                <input
                  type="text"
                  required
                  value={formLabel}
                  onChange={(e) => setFormLabel(e.target.value)}
                  placeholder="e.g. What is my dream destination?"
                  className="cream-input text-xs py-2.5"
                />
              </div>

              {/* Subtitle / Hint */}
              <div>
                <label className="block text-[#B9A8C9] mb-1.5 font-medium">
                  Description / Hint (Optional)
                </label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="e.g. Think of somewhere warm and sunny"
                  className="cream-input text-xs py-2.5"
                />
              </div>

              {/* Question Type */}
              <div>
                <label className="block text-[#B9A8C9] mb-1.5 font-medium">
                  Question Type
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
                          setFormCorrectAnswer(9);
                        } else if (t === 'text') {
                          setFormCorrectAnswer('');
                        }
                      }}
                      className={`py-2 px-3 rounded-[14px] text-xs font-medium transition cursor-pointer ${
                        formType === t
                          ? 'bg-[#FF6B4A] text-white shadow-[0_2px_10px_rgba(255,107,74,0.3)]'
                          : 'bg-white/[0.05] hover:bg-white/[0.1] text-[#B9A8C9]'
                      }`}
                    >
                      {t === 'select' ? 'Multiple Choice' : t === 'text' ? 'Open Text' : 'Rating Scale'}
                    </button>
                  ))}
                </div>
              </div>

              {/* TYPE: SELECT */}
              {formType === 'select' && (
                <div className="p-4 rounded-[20px] bg-white/[0.04] space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[#FBF4EA] font-medium">
                      Options & Set Correct Answer:
                    </label>
                    <span className="text-[11px] text-[#8C789B]">
                      Select radio for correct answer
                    </span>
                  </div>

                  <div className="space-y-2">
                    {formOptions.map((opt, oIdx) => {
                      const isCorrect = String(formCorrectAnswer) === opt;
                      return (
                        <div
                          key={oIdx}
                          onClick={() => setFormCorrectAnswer(opt)}
                          className={`p-3 rounded-[16px] flex items-center justify-between gap-2 cursor-pointer transition ${
                            isCorrect
                              ? 'bg-emerald-500/20 text-[#FBF4EA]'
                              : 'bg-white/[0.04] text-[#B9A8C9]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="radio"
                              name="correctAnswerSelect"
                              checked={isCorrect}
                              onChange={() => setFormCorrectAnswer(opt)}
                              className="accent-[#FF6B4A] cursor-pointer"
                            />
                            <span className="font-medium text-xs">{opt}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {isCorrect && (
                              <span className="text-[10px] text-emerald-300 font-semibold">
                                Correct
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveOption(opt);
                              }}
                              className="p-1 text-[#8C789B] hover:text-rose-400"
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
                      placeholder="Add an option..."
                      className="flex-1 cream-input text-xs py-2 px-3"
                    />
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="btn-secondary text-xs py-2 px-3"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}

              {/* TYPE: TEXT */}
              {formType === 'text' && (
                <div className="p-4 rounded-[20px] bg-white/[0.04] space-y-3">
                  <div>
                    <label className="block text-[#B9A8C9] mb-1 font-medium">
                      Official Correct Answer *
                    </label>
                    <input
                      type="text"
                      required
                      value={String(formCorrectAnswer)}
                      onChange={(e) => setFormCorrectAnswer(e.target.value)}
                      placeholder="e.g. Kwame"
                      className="cream-input text-xs py-2.5"
                    />
                  </div>

                  <div>
                    <label className="block text-[#B9A8C9] mb-1 font-medium">
                      Accepted Aliases (Comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formAlternatives}
                      onChange={(e) => setFormAlternatives(e.target.value)}
                      placeholder="e.g. kwame, kofi, kwesi, denzel"
                      className="cream-input text-xs py-2.5"
                    />
                    <span className="text-[11px] text-[#8C789B] mt-1 block">
                      Matches case-insensitively and allows nicknames.
                    </span>
                  </div>
                </div>
              )}

              {/* TYPE: SCALE */}
              {formType === 'scale' && (
                <div className="p-4 rounded-[20px] bg-white/[0.04] space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[#B9A8C9] mb-1">Min Value</label>
                      <input
                        type="number"
                        value={formMin}
                        onChange={(e) => setFormMin(parseInt(e.target.value, 10))}
                        className="cream-input text-xs py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-[#B9A8C9] mb-1">Max Value</label>
                      <input
                        type="number"
                        value={formMax}
                        onChange={(e) => setFormMax(parseInt(e.target.value, 10))}
                        className="cream-input text-xs py-2"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#B9A8C9] mb-1">
                      Target Correct Rating (Numeric) *
                    </label>
                    <input
                      type="number"
                      min={formMin}
                      max={formMax}
                      value={Number(formCorrectAnswer)}
                      onChange={(e) => setFormCorrectAnswer(parseInt(e.target.value, 10))}
                      className="cream-input text-xs py-2"
                    />
                    <span className="text-[11px] text-[#8C789B] mt-1 block">
                      Participants within ±1 point will be counted as correct.
                    </span>
                  </div>
                </div>
              )}

              {/* Fun Lore Explanation */}
              <div>
                <label className="block text-[#B9A8C9] mb-1 font-medium">
                  Fun Lore / Explanation (Shown in Results & Leaderboard)
                </label>
                <input
                  type="text"
                  value={formExplanation}
                  onChange={(e) => setFormExplanation(e.target.value)}
                  placeholder="e.g. Because nothing beats fresh sushi at 2 AM!"
                  className="cream-input text-xs py-2.5"
                />
              </div>

              {/* Submit / Cancel */}
              <div className="pt-4 border-t border-white/[0.06] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingQuestion(null);
                  }}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs"
                >
                  {editingQuestion ? 'Update Question' : 'Save Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
