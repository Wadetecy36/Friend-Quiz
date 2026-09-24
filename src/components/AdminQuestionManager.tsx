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
  Check,
  X,
  Sliders,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  Hash,
  ListOrdered,
  FileQuestion,
  AlignLeft,
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
      // Automatically expand active count if new question extends beyond current
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
    <div className="space-y-6">
      {/* Save Notification */}
      {saveBanner && (
        <div className="fixed top-20 right-6 z-50 p-3 bg-[#3D8F70] text-white border-2 border-stone-900 rounded-2xl shadow-brutal text-xs font-mono font-bold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 stroke-[3]" />
          <span>Questions & quiz settings saved!</span>
        </div>
      )}

      {/* Control Banner: Quiz Length Stepper & Actions */}
      <div className="bg-[#FFFDF9] border-[2.5px] border-stone-900 rounded-[28px] p-6 shadow-brutal space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-stone-200">
          <div>
            <div className="font-mono text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-stone-700" />
              Quiz Size & Question Customizer
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 mt-1">
              Active Quiz Length: <span className="text-[#3D8F70]">{activeCount} Questions</span>
            </h2>
            <p className="text-xs text-stone-600 mt-0.5">
              Participants will be asked the first <strong>{activeCount}</strong> questions in your list (Min: {MIN_QUESTIONS_COUNT}, Max: {MAX_QUESTIONS_COUNT}).
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={openCreateModal}
              className="px-4 py-2.5 rounded-2xl border-2 border-stone-900 bg-[#3D8F70] hover:bg-[#347b60] text-white font-bold text-xs shadow-brutal-sm flex items-center gap-1.5 cursor-pointer transition"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Custom Question</span>
            </button>

            <button
              onClick={() => setShowPresets(!showPresets)}
              className="px-3.5 py-2.5 rounded-2xl border-2 border-stone-900 bg-[#F9C84E] hover:bg-[#eab332] text-stone-900 font-bold text-xs shadow-brutal-sm flex items-center gap-1.5 cursor-pointer transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>Idea Library</span>
            </button>
          </div>
        </div>

        {/* Question Count Stepper & Quick Presets */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF7F0] p-4 rounded-2xl border border-stone-900">
            <div className="font-mono text-xs text-stone-800">
              <span className="font-bold">Set Quiz Size (5 – 20):</span>
              <span className="block text-[11px] text-stone-500">
                Total questions in your bank: {questionsList.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="range"
                min={MIN_QUESTIONS_COUNT}
                max={Math.min(MAX_QUESTIONS_COUNT, questionsList.length)}
                value={activeCount}
                onChange={(e) => handleActiveCountChange(parseInt(e.target.value, 10))}
                className="w-32 sm:w-48 accent-[#3D8F70] cursor-pointer"
              />
              <span className="font-mono font-black text-sm text-stone-900 px-3 py-1 bg-white border border-stone-900 rounded-xl">
                {activeCount}
              </span>
            </div>
          </div>

          {/* Quick preset buttons */}
          <div className="flex items-center gap-2 flex-wrap font-mono text-xs">
            <span className="text-stone-500 font-bold text-[11px]">Quick presets:</span>
            {[5, 8, 10, 12, 15, 20].map((num) => (
              <button
                key={num}
                disabled={num > questionsList.length}
                onClick={() => handleActiveCountChange(num)}
                className={`px-2.5 py-1 rounded-xl border border-stone-900 transition cursor-pointer text-xs ${
                  activeCount === num
                    ? 'bg-stone-900 text-white font-black'
                    : 'bg-white hover:bg-stone-100 text-stone-800 font-bold disabled:opacity-40 disabled:cursor-not-allowed'
                }`}
              >
                {num} Qs
              </button>
            ))}

            <button
              onClick={handleResetToDefault}
              className="ml-auto text-[11px] font-mono font-bold text-stone-500 hover:text-rose-700 flex items-center gap-1 cursor-pointer transition"
              title="Reset questions to Denzel's 20 default questions"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Defaults</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preset Ideas Drawer */}
      {showPresets && (
        <div className="p-5 rounded-[24px] border-2 border-stone-900 bg-[#FAF7F0] shadow-brutal space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <h3 className="font-black text-sm text-stone-900">
                Preset Question Ideas (Click to Add):
              </h3>
            </div>
            <button
              onClick={() => setShowPresets(false)}
              className="p-1 text-stone-500 hover:text-stone-900"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono text-xs">
            {PRESET_IDEAS.map((idea, idx) => (
              <div
                key={idx}
                className="p-3 bg-white border border-stone-900 rounded-xl space-y-1.5 flex flex-col justify-between"
              >
                <div>
                  <div className="font-bold text-stone-900">{idea.label}</div>
                  <div className="text-[11px] text-stone-500">{idea.description}</div>
                  <div className="text-[10px] text-[#3D8F70] font-bold mt-1">
                    Correct: {String(idea.correctAnswer)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleAddPreset(idea)}
                  className="mt-2 w-full py-1.5 px-3 rounded-lg border border-stone-900 bg-[#FAF7F0] hover:bg-[#3D8F70] hover:text-white font-bold text-[11px] transition cursor-pointer flex items-center justify-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add to Quiz
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Question Cards List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-black text-base text-stone-900 flex items-center gap-2">
            <ListOrdered className="w-4 h-4 text-stone-700" />
            Questions Ordered List ({questionsList.length} Total)
          </h3>
          <span className="font-mono text-xs text-stone-500 font-bold">
            Top {activeCount} active in quiz
          </span>
        </div>

        {questionsList.map((q, index) => {
          const isActive = index < activeCount;

          return (
            <div
              key={q.id}
              className={`border-[2.5px] border-stone-900 rounded-2xl p-4 sm:p-5 shadow-brutal transition ${
                isActive ? 'bg-[#FFFDF9]' : 'bg-[#F5F2EB] opacity-65'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  {/* Order Number Badge */}
                  <div
                    className={`w-9 h-9 rounded-xl border-2 border-stone-900 flex items-center justify-center font-black text-sm flex-shrink-0 ${
                      isActive ? 'bg-[#F9C84E] text-stone-900' : 'bg-stone-300 text-stone-600'
                    }`}
                  >
                    #{index + 1}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-base text-stone-900">
                        {q.label}
                      </span>
                      <span
                        className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full border border-stone-900 uppercase ${
                          q.type === 'select'
                            ? 'bg-blue-100 text-blue-900'
                            : q.type === 'scale'
                            ? 'bg-purple-100 text-purple-900'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {q.type}
                      </span>
                      {isActive ? (
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#1B5E20] border border-stone-900">
                          Active in Quiz
                        </span>
                      ) : (
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-200 text-stone-600">
                          Inactive (Bank only)
                        </span>
                      )}
                    </div>

                    {q.description && (
                      <p className="text-xs text-stone-600">{q.description}</p>
                    )}

                    {/* Correct Answer Display */}
                    <div className="pt-1.5 font-mono text-xs flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-stone-700">Official Correct:</span>
                      <span className="px-2 py-0.5 rounded-lg bg-[#3D8F70] text-white font-bold">
                        {String(q.correctAnswer ?? 'Not set')}
                      </span>
                      {q.explanation && (
                        <span className="text-[11px] text-stone-500 italic">
                          ({q.explanation})
                        </span>
                      )}
                    </div>

                    {/* Options list if select */}
                    {q.type === 'select' && q.options && (
                      <div className="pt-1 flex flex-wrap gap-1 font-mono text-[11px]">
                        {q.options.map((opt) => (
                          <span
                            key={opt}
                            className={`px-2 py-0.5 rounded-md border text-[10px] ${
                              String(q.correctAnswer) === opt
                                ? 'bg-emerald-100 border-emerald-600 text-emerald-900 font-bold'
                                : 'bg-white border-stone-300 text-stone-600'
                            }`}
                          >
                            {opt}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Question Actions (Up, Down, Edit, Delete) */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleMove(index, 'up')}
                    disabled={index === 0}
                    className="p-1.5 rounded-lg border border-stone-900 hover:bg-stone-100 text-stone-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    title="Move up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleMove(index, 'down')}
                    disabled={index === questionsList.length - 1}
                    className="p-1.5 rounded-lg border border-stone-900 hover:bg-stone-100 text-stone-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    title="Move down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => openEditModal(q)}
                    className="p-1.5 rounded-lg border border-stone-900 hover:bg-stone-100 text-stone-800 cursor-pointer"
                    title="Edit question & answer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(q.id, q.label)}
                    disabled={questionsList.length <= MIN_QUESTIONS_COUNT}
                    className="p-1.5 rounded-lg border border-stone-900 hover:bg-rose-100 text-rose-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4">
          <div className="bg-[#FFFDF9] border-[3px] border-stone-900 rounded-[28px] max-w-xl w-full p-6 sm:p-8 shadow-brutal max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b-2 border-stone-200">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#F9C84E] border-2 border-stone-900 flex items-center justify-center font-black">
                  <FileQuestion className="w-5 h-5 text-stone-900" />
                </div>
                <h3 className="text-lg font-black text-stone-900">
                  {editingQuestion ? 'Edit Question & Answer' : 'Create Custom Question'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setEditingQuestion(null);
                }}
                className="p-1.5 rounded-xl border border-stone-900 hover:bg-stone-100 text-stone-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4 font-mono text-xs">
              {/* Question Label */}
              <div>
                <label className="block text-stone-800 font-bold uppercase mb-1">
                  Question Prompt *
                </label>
                <input
                  type="text"
                  required
                  value={formLabel}
                  onChange={(e) => setFormLabel(e.target.value)}
                  placeholder="e.g. What is my dream destination?"
                  className="w-full bg-[#FAF7F0] border-2 border-stone-900 rounded-xl px-3.5 py-2.5 font-bold text-stone-900 focus:outline-none focus:bg-white"
                />
              </div>

              {/* Subtitle / Hint */}
              <div>
                <label className="block text-stone-800 font-bold uppercase mb-1">
                  Description / Hint (Optional)
                </label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="e.g. Think of somewhere warm and sunny"
                  className="w-full bg-[#FAF7F0] border border-stone-900 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:bg-white"
                />
              </div>

              {/* Question Type */}
              <div>
                <label className="block text-stone-800 font-bold uppercase mb-1">
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
                      className={`py-2 px-3 rounded-xl border-2 border-stone-900 font-bold uppercase text-[11px] transition cursor-pointer ${
                        formType === t ? 'bg-stone-900 text-white' : 'bg-white text-stone-800 hover:bg-stone-100'
                      }`}
                    >
                      {t === 'select' ? 'Multiple Choice' : t === 'text' ? 'Open Text' : 'Rating Scale'}
                    </button>
                  ))}
                </div>
              </div>

              {/* TYPE: SELECT */}
              {formType === 'select' && (
                <div className="p-4 rounded-xl border-2 border-stone-900 bg-[#FAF7F0] space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-stone-900">
                      Options & Select the Correct Answer:
                    </label>
                    <span className="text-[10px] text-stone-500">
                      Click circle to set correct answer
                    </span>
                  </div>

                  <div className="space-y-2">
                    {formOptions.map((opt, oIdx) => {
                      const isCorrect = String(formCorrectAnswer) === opt;
                      return (
                        <div
                          key={oIdx}
                          onClick={() => setFormCorrectAnswer(opt)}
                          className={`p-2.5 rounded-xl border-2 flex items-center justify-between gap-2 cursor-pointer transition ${
                            isCorrect
                              ? 'bg-emerald-50 border-emerald-700 shadow-sm'
                              : 'bg-white border-stone-400'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="correctAnswerSelect"
                              checked={isCorrect}
                              onChange={() => setFormCorrectAnswer(opt)}
                              className="accent-[#3D8F70] cursor-pointer"
                            />
                            <span className="font-bold text-stone-900">{opt}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            {isCorrect && (
                              <span className="text-[10px] font-black uppercase text-[#1B5E20] bg-emerald-100 px-2 py-0.5 rounded-full">
                                Correct Answer
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveOption(opt);
                              }}
                              className="p-1 text-stone-400 hover:text-rose-600"
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
                      className="flex-1 bg-white border border-stone-900 rounded-xl px-3 py-2 text-stone-900"
                    />
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="px-3 py-2 rounded-xl border border-stone-900 bg-stone-900 text-white font-bold cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}

              {/* TYPE: TEXT */}
              {formType === 'text' && (
                <div className="p-4 rounded-xl border-2 border-stone-900 bg-[#FAF7F0] space-y-3">
                  <div>
                    <label className="block text-stone-800 font-bold uppercase mb-1">
                      Official Correct Answer *
                    </label>
                    <input
                      type="text"
                      required
                      value={String(formCorrectAnswer)}
                      onChange={(e) => setFormCorrectAnswer(e.target.value)}
                      placeholder="e.g. Kwame"
                      className="w-full bg-white border border-stone-900 rounded-xl px-3 py-2 font-bold text-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-800 font-bold uppercase mb-1">
                      Accepted Alternatives / Aliases (Comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formAlternatives}
                      onChange={(e) => setFormAlternatives(e.target.value)}
                      placeholder="e.g. kwame, kofi, kwesi, denzel"
                      className="w-full bg-white border border-stone-900 rounded-xl px-3 py-2 text-stone-900"
                    />
                    <span className="text-[10px] text-stone-500 mt-0.5 block">
                      Matches case-insensitively and allows common abbreviations or spellings.
                    </span>
                  </div>
                </div>
              )}

              {/* TYPE: SCALE */}
              {formType === 'scale' && (
                <div className="p-4 rounded-xl border-2 border-stone-900 bg-[#FAF7F0] space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-stone-800 font-bold mb-1">Min Value</label>
                      <input
                        type="number"
                        value={formMin}
                        onChange={(e) => setFormMin(parseInt(e.target.value, 10))}
                        className="w-full bg-white border border-stone-900 rounded-xl px-3 py-1.5"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-800 font-bold mb-1">Max Value</label>
                      <input
                        type="number"
                        value={formMax}
                        onChange={(e) => setFormMax(parseInt(e.target.value, 10))}
                        className="w-full bg-white border border-stone-900 rounded-xl px-3 py-1.5"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-stone-800 font-bold mb-1">Min Label</label>
                      <input
                        type="text"
                        value={formMinLabel}
                        onChange={(e) => setFormMinLabel(e.target.value)}
                        className="w-full bg-white border border-stone-900 rounded-xl px-3 py-1.5"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-800 font-bold mb-1">Max Label</label>
                      <input
                        type="text"
                        value={formMaxLabel}
                        onChange={(e) => setFormMaxLabel(e.target.value)}
                        className="w-full bg-white border border-stone-900 rounded-xl px-3 py-1.5"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-stone-800 font-bold mb-1">
                      Target Correct Rating (Numeric) *
                    </label>
                    <input
                      type="number"
                      min={formMin}
                      max={formMax}
                      value={Number(formCorrectAnswer)}
                      onChange={(e) => setFormCorrectAnswer(parseInt(e.target.value, 10))}
                      className="w-full bg-white border border-stone-900 rounded-xl px-3 py-1.5 font-bold"
                    />
                    <span className="text-[10px] text-stone-500 mt-0.5 block">
                      Participants within ±1 point will be counted as correct.
                    </span>
                  </div>
                </div>
              )}

              {/* Fun Lore Explanation */}
              <div>
                <label className="block text-stone-800 font-bold uppercase mb-1">
                  Fun Lore / Explanation (Shown in Leaderboard & Results)
                </label>
                <input
                  type="text"
                  value={formExplanation}
                  onChange={(e) => setFormExplanation(e.target.value)}
                  placeholder="e.g. Because nothing beats fresh sushi at 2 AM!"
                  className="w-full bg-[#FAF7F0] border border-stone-900 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:bg-white"
                />
              </div>

              {/* Submit / Cancel */}
              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingQuestion(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-stone-900 bg-white font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl border-2 border-stone-900 bg-[#3D8F70] hover:bg-[#347b60] text-white font-bold shadow-brutal-sm cursor-pointer"
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
