'use client';

import { useEffect, useMemo, useState } from 'react';
import { Play, Trash2, Plus, Sparkles, Search } from 'lucide-react';
import { api } from '@/lib/api';
import {
  WizardShell,
  FormField,
  TextInput,
  TextArea,
  Avatar,
  TabNavItem,
} from '@/components/ui';

/* ------------------------------------------------------------------ */
/*  LessonWizard — shared between /new and /[id]/edit                  */
/* ------------------------------------------------------------------ */

type TabId = 'details' | 'video' | 'quiz' | 'teachers';

interface LessonFormState {
  title: string;
  topic: string;
  description: string;
  isMandatory: boolean;
  isOptional: boolean;
  videoUrl: string;
}

interface QuizQuestionDraft {
  id: string; // local-only uuid
  text: string;
  correctIndex: number;
  options: string[];
}

const EMPTY_FORM: LessonFormState = {
  title: '',
  topic: '',
  description: '',
  isMandatory: false,
  isOptional: false,
  videoUrl: '',
};

const makeQuestion = (): QuizQuestionDraft => ({
  id: Math.random().toString(36).slice(2),
  text: '',
  correctIndex: 0,
  options: ['', '', '', ''],
});

interface LessonWizardProps {
  mode: 'create' | 'edit';
  lessonId?: string;
  label: string;
  title: string;
  primaryCta: string;
  onCancel: () => void;
  onDone: () => void;
}

export default function LessonWizard({
  mode,
  lessonId,
  label,
  title,
  primaryCta,
  onCancel,
  onDone,
}: LessonWizardProps) {
  const [activeTab, setActiveTab] = useState<TabId>('details');
  const [form, setForm] = useState<LessonFormState>(EMPTY_FORM);
  const [questions, setQuestions] = useState<QuizQuestionDraft[]>([makeQuestion()]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [selectedTeachers, setSelectedTeachers] = useState<Set<string>>(new Set());
  const [teacherSearch, setTeacherSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(mode === 'edit');

  /* ---------- load existing lesson (edit mode) ---------- */
  useEffect(() => {
    if (mode !== 'edit' || !lessonId) return;
    setLoading(true);
    api.lessons
      .get(lessonId)
      .then((lesson: any) => {
        setForm({
          title: lesson.title ?? '',
          topic: lesson.topic ?? '',
          description: lesson.description ?? '',
          isMandatory: lesson.isMandatory ?? false,
          isOptional: lesson.isOptional ?? false,
          videoUrl: lesson.videoUrl ?? '',
        });
        // Map saved units -> local question drafts (if any).
        const unit = lesson.units?.[0];
        if (unit?.quizQuestions?.length) {
          setQuestions(
            unit.quizQuestions.map((q: any) => ({
              id: q.id,
              text: q.text,
              correctIndex: Math.max(
                0,
                (q.options || []).findIndex((o: any) => o.isCorrect),
              ),
              options: (q.options || []).map((o: any) => o.text),
            })),
          );
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [mode, lessonId]);

  /* ---------- load teachers for Add Teachers tab ---------- */
  useEffect(() => {
    api.users
      .list('TEACHER')
      .then(list => setTeachers(Array.isArray(list) ? list : []))
      .catch(console.error);
  }, []);

  /* ---------- tabs ---------- */
  const tabs: TabNavItem[] = [
    { id: 'details', label: 'Details' },
    { id: 'video', label: 'Video' },
    { id: 'quiz', label: 'Quiz' },
    { id: 'teachers', label: 'Add Teachers' },
  ];

  /* ---------- save ---------- */
  const buildPayload = (status: 'DRAFT' | 'PUBLISHED') => ({
    title: form.title,
    topic: form.topic || undefined,
    description: form.description || undefined,
    videoUrl: form.videoUrl || undefined,
    isMandatory: form.isMandatory,
    isOptional: form.isOptional,
    status,
  });

  const persistQuizAndTeachers = async (savedLessonId: string) => {
    // Stub complex relationships: only create a unit + questions
    // when the user actually filled in quiz content.
    const hasContent = questions.some(q => q.text.trim().length > 0);
    if (hasContent) {
      try {
        const unit = await api.lessons.createUnit({
          lessonId: savedLessonId,
          title: form.title || 'Unit 1',
          description: form.description || undefined,
          order: 0,
          keyTakeaways: [],
        });
        for (const q of questions) {
          if (!q.text.trim()) continue;
          await api.lessons.createQuestion({
            unitId: unit.id,
            text: q.text,
            order: 0,
            xpValue: 10,
            options: q.options.map((opt, i) => ({
              text: opt,
              isCorrect: i === q.correctIndex,
            })),
          });
        }
      } catch (err) {
        console.error('Failed to save quiz', err);
      }
    }

    // Assign selected teachers (best-effort; skip on error).
    const teacherIds = Array.from(selectedTeachers);
    for (const userId of teacherIds) {
      try {
        await api.groups.assign({ lessonId: savedLessonId, userId });
      } catch (err) {
        console.error('Failed to assign teacher', userId, err);
      }
    }
  };

  const handleSave = async (status: 'DRAFT' | 'PUBLISHED') => {
    if (!form.title.trim()) {
      setActiveTab('details');
      return;
    }
    setSaving(true);
    try {
      if (mode === 'edit' && lessonId) {
        await api.lessons.update(lessonId, buildPayload(status));
        await persistQuizAndTeachers(lessonId);
      } else {
        const created = await api.lessons.create(buildPayload(status));
        if (created?.id) await persistQuizAndTeachers(created.id);
      }
      onDone();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  /* ---------- footer ---------- */
  const footer = (
    <div className="flex items-center justify-between w-full">
      <button
        type="button"
        onClick={onCancel}
        className="text-sm font-semibold text-[#6b7280] hover:text-[#374151] px-4 py-2 transition-colors"
      >
        Cancel
      </button>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => handleSave('DRAFT')}
          disabled={saving}
          className="text-sm font-bold text-[#00609b] bg-white border border-[#00609b] hover:bg-[#eff6ff] px-6 py-2.5 rounded-full transition-colors disabled:opacity-40"
        >
          Save as Draft
        </button>
        <button
          type="button"
          onClick={() => handleSave('PUBLISHED')}
          disabled={saving || !form.title.trim()}
          className="text-sm font-bold text-white bg-[#00609b] hover:bg-[#004a79] px-6 py-2.5 rounded-full transition-colors disabled:opacity-40"
        >
          {saving ? 'Saving...' : primaryCta}
        </button>
      </div>
    </div>
  );

  return (
    <WizardShell
      label={label}
      title={title}
      tabs={tabs}
      activeTabId={activeTab}
      onTabChange={id => setActiveTab(id as TabId)}
      footer={footer}
    >
      {loading ? (
        <div className="py-16 text-center text-sm text-[#9ca3af]">Loading lesson...</div>
      ) : (
        <>
          {activeTab === 'details' && (
            <DetailsTab form={form} setForm={setForm} />
          )}
          {activeTab === 'video' && (
            <VideoTab form={form} setForm={setForm} />
          )}
          {activeTab === 'quiz' && (
            <QuizTab
              form={form}
              questions={questions}
              setQuestions={setQuestions}
            />
          )}
          {activeTab === 'teachers' && (
            <TeachersTab
              teachers={teachers}
              selected={selectedTeachers}
              setSelected={setSelectedTeachers}
              search={teacherSearch}
              setSearch={setTeacherSearch}
            />
          )}
        </>
      )}
    </WizardShell>
  );
}

/* ================================================================== */
/*  Details Tab                                                        */
/* ================================================================== */

function DetailsTab({
  form,
  setForm,
}: {
  form: LessonFormState;
  setForm: (f: LessonFormState) => void;
}) {
  const charCount = form.description.length;

  return (
    <div className="space-y-5 max-w-[760px]">
      <FormField label="Lesson Title" required>
        <TextInput
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
          placeholder="Advanced Biology: Unit 4"
        />
      </FormField>

      <FormField label="Topic" required>
        <TextInput
          value={form.topic}
          onChange={e => setForm({ ...form, topic: e.target.value })}
          placeholder="Cellular Respiration"
        />
      </FormField>

      <FormField label="Type" required>
        <div className="flex items-center gap-3">
          <TypeToggle
            active={form.isMandatory}
            onClick={() => setForm({ ...form, isMandatory: !form.isMandatory })}
          >
            Mandatory
          </TypeToggle>
          <TypeToggle
            active={form.isOptional}
            onClick={() => setForm({ ...form, isOptional: !form.isOptional })}
          >
            Optional
          </TypeToggle>
        </div>
      </FormField>

      <FormField label="Description">
        <>
          <TextArea
            rows={6}
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value.slice(0, 2000) })}
            placeholder="This unit explores the intricate metabolic pathways of cellular respiration..."
          />
          <p className="text-[11px] text-[#9ca3af] text-right mt-1">
            {charCount} / 2000 characters
          </p>
        </>
      </FormField>
    </div>
  );
}

function TypeToggle({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-6 py-2 rounded-full text-sm font-bold border transition-colors ${
        active
          ? 'bg-[#00609b] text-white border-[#00609b]'
          : 'bg-white text-[#374151] border-[#d1d5db] hover:border-[#00609b]'
      }`}
    >
      {children}
    </button>
  );
}

/* ================================================================== */
/*  Video Tab                                                          */
/* ================================================================== */

function VideoTab({
  form,
  setForm,
}: {
  form: LessonFormState;
  setForm: (f: LessonFormState) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6 items-start">
      {/* Preview */}
      <div className="bg-[#1f2937] rounded-[20px] aspect-video flex items-center justify-center overflow-hidden relative">
        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <Play size={28} className="text-white ml-1" />
        </div>
        <div className="absolute bottom-3 left-4 text-[11px] font-medium text-white/70">
          Video preview
        </div>
      </div>

      {/* URL field */}
      <div className="space-y-4">
        <FormField label="Video Source URL">
          <TextInput
            value={form.videoUrl}
            onChange={e => setForm({ ...form, videoUrl: e.target.value })}
            placeholder="https://www.youtube.com/embed/..."
          />
        </FormField>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Quiz Tab                                                           */
/* ================================================================== */

function QuizTab({
  form,
  questions,
  setQuestions,
}: {
  form: LessonFormState;
  questions: QuizQuestionDraft[];
  setQuestions: (q: QuizQuestionDraft[]) => void;
}) {
  const [numQuestions, setNumQuestions] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const updateQuestion = (idx: number, patch: Partial<QuizQuestionDraft>) => {
    setQuestions(questions.map((q, i) => (i === idx ? { ...q, ...patch } : q)));
  };

  const updateOption = (qIdx: number, optIdx: number, value: string) => {
    setQuestions(
      questions.map((q, i) =>
        i === qIdx ? { ...q, options: q.options.map((o, j) => (j === optIdx ? value : o)) } : q,
      ),
    );
  };

  const addQuestion = () => setQuestions([...questions, makeQuestion()]);
  const removeQuestion = (idx: number) =>
    setQuestions(questions.filter((_, i) => i !== idx));

  const addOption = (qIdx: number) => {
    const q = questions[qIdx];
    if (q.options.length >= 5) return;
    updateQuestion(qIdx, { options: [...q.options, ''] });
  };

  /**
   * Generate quiz questions with OpenAI and append them to the current
   * question list. Requires title + topic on the Details tab.
   */
  const canGenerate = form.title.trim().length > 0 && form.topic.trim().length > 0;

  const handleGenerate = async () => {
    if (!canGenerate || generating) return;
    setGenerating(true);
    setAiError(null);
    try {
      const res: {
        questions: Array<{
          text: string;
          explanation: string;
          options: Array<{ text: string; isCorrect: boolean }>;
        }>;
      } = await api.lessons.generateQuiz({
        lessonTitle: form.title.trim(),
        topic: form.topic.trim(),
        description: form.description.trim() || undefined,
        numQuestions,
      });

      const generated: QuizQuestionDraft[] = res.questions.map((q) => {
        const correctIndex = Math.max(
          0,
          q.options.findIndex((o) => o.isCorrect),
        );
        return {
          id: Math.random().toString(36).slice(2),
          text: q.text,
          correctIndex,
          options: q.options.map((o) => o.text),
        };
      });

      // Append to existing questions, dropping any empty manually-added cards
      const keep = questions.filter(
        (q) => q.text.trim().length > 0 || q.options.some((o) => o.trim().length > 0),
      );
      setQuestions([...keep, ...generated]);
    } catch (e: any) {
      setAiError(
        e?.message || 'Failed to generate questions. Try again in a moment.',
      );
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="text-base font-bold text-[#181c21]">
          Quiz Questions ({questions.length})
        </h3>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={addQuestion}
            className="flex items-center gap-1.5 text-xs font-bold text-[#00609b] border border-[#00609b] bg-white hover:bg-[#eff6ff] px-4 py-2 rounded-full transition-colors"
          >
            <Plus size={14} />
            Add Manually
          </button>

          {/* Number of questions input */}
          <div className="flex items-center gap-1.5 bg-white border border-[#e5e7eb] rounded-full px-3 py-1.5">
            <label htmlFor="num-q" className="text-[10px] font-semibold text-[#707882] uppercase tracking-wider">
              Count
            </label>
            <input
              id="num-q"
              type="number"
              min={1}
              max={10}
              value={numQuestions}
              onChange={(e) => {
                const n = Number(e.target.value);
                if (Number.isFinite(n)) setNumQuestions(Math.max(1, Math.min(10, n)));
              }}
              className="w-10 text-xs font-bold text-[#181c21] bg-transparent outline-none text-center"
            />
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={!canGenerate || generating}
            title={
              !canGenerate
                ? 'Add a title and topic on the Details tab first'
                : 'Generate multiple-choice questions with AI'
            }
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#982d94] hover:bg-[#7c2379] disabled:bg-[#d7bdd5] disabled:cursor-not-allowed px-4 py-2 rounded-full transition-colors"
          >
            {generating ? (
              <>
                <span className="inline-block w-3 h-3 rounded-full border-2 border-white/60 border-t-white animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <Sparkles size={14} />
                Generate with AI
              </>
            )}
          </button>
        </div>
      </div>

      {/* Inline error */}
      {aiError && (
        <div className="bg-[#fef2f2] border border-[#fecaca] rounded-[14px] px-4 py-3 text-xs font-medium text-[#991b1b]">
          {aiError}
        </div>
      )}

      {/* Question cards */}
      <div className="space-y-4">
        {questions.map((q, idx) => (
          <div
            key={q.id}
            className="border border-[#e5e7eb] rounded-[20px] p-5 bg-white space-y-3"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-[#181c21]">Question {idx + 1}</h4>
              <button
                type="button"
                onClick={() => removeQuestion(idx)}
                className="w-8 h-8 rounded-lg hover:bg-[#fee2e2] flex items-center justify-center transition-colors"
                aria-label="Remove question"
              >
                <Trash2 size={14} className="text-[#ef4444]" />
              </button>
            </div>

            <TextArea
              rows={2}
              value={q.text}
              onChange={e => updateQuestion(idx, { text: e.target.value })}
              placeholder="Enter question..."
            />

            <p className="text-[11px] font-medium text-[#707882]">
              Select the correct answer by clicking the radio button:
            </p>

            <div className="space-y-2">
              {q.options.map((opt, optIdx) => (
                <div key={optIdx} className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => updateQuestion(idx, { correctIndex: optIdx })}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      q.correctIndex === optIdx
                        ? 'border-[#00609b] bg-[#00609b]'
                        : 'border-[#d1d5db] bg-white'
                    }`}
                    aria-label={`Mark option ${optIdx + 1} as correct`}
                  >
                    {q.correctIndex === optIdx && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </button>
                  <TextInput
                    value={opt}
                    onChange={e => updateOption(idx, optIdx, e.target.value)}
                    placeholder={`Option ${optIdx + 1}`}
                  />
                </div>
              ))}

              {q.options.length < 5 && (
                <button
                  type="button"
                  onClick={() => addOption(idx)}
                  className="text-xs font-semibold text-[#00609b] hover:underline ml-8"
                >
                  + Add option
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Another Question */}
      <button
        type="button"
        onClick={addQuestion}
        className="w-full py-3 rounded-[20px] border-2 border-dashed border-[#d1d5db] text-sm font-bold text-[#707882] hover:text-[#00609b] hover:border-[#00609b] transition-colors"
      >
        + Add Another Question
      </button>
    </div>
  );
}

/* ================================================================== */
/*  Teachers Tab                                                       */
/* ================================================================== */

function TeachersTab({
  teachers,
  selected,
  setSelected,
  search,
  setSearch,
}: {
  teachers: any[];
  selected: Set<string>;
  setSelected: (s: Set<string>) => void;
  search: string;
  setSearch: (s: string) => void;
}) {
  const filtered = useMemo(() => {
    if (!search) return teachers;
    const q = search.toLowerCase();
    return teachers.filter(
      t => t.name?.toLowerCase().includes(q) || t.email?.toLowerCase().includes(q),
    );
  }, [teachers, search]);

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-[480px]">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]"
        />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search teachers..."
          className="w-full h-11 pl-11 pr-4 rounded-full border border-[#e5e7eb] bg-white text-sm text-[#111827] placeholder:text-[#9ca3af] focus:border-[#00609b] outline-none"
        />
      </div>

      {/* Teacher rows */}
      <div className="border border-[#e5e7eb] rounded-[20px] overflow-hidden divide-y divide-[#f3f4f6]">
        {filtered.length === 0 && (
          <div className="py-10 text-center text-sm text-[#9ca3af]">No teachers found</div>
        )}
        {filtered.map(teacher => {
          const checked = selected.has(teacher.id);
          return (
            <label
              key={teacher.id}
              className="flex items-center gap-3 px-5 py-3 hover:bg-[#f9fafb] cursor-pointer transition-colors"
            >
              <div
                onClick={e => {
                  e.preventDefault();
                  toggle(teacher.id);
                }}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  checked ? 'bg-[#00609b] border-[#00609b]' : 'border-[#d1d5db]'
                }`}
              >
                {checked && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                )}
              </div>
              <Avatar name={teacher.name || 'T'} src={teacher.avatar} size={36} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#181c21] truncate">{teacher.name}</p>
                <p className="text-xs text-[#707882] truncate">{teacher.email}</p>
              </div>
            </label>
          );
        })}
      </div>

      {/* Footer summary */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-sm text-[#707882]">{selected.size} teachers selected</p>
        <button
          type="button"
          disabled={selected.size === 0}
          className="text-sm font-bold text-white bg-[#00609b] hover:bg-[#004a79] disabled:opacity-40 px-5 py-2 rounded-full transition-colors"
        >
          Assign to selected
        </button>
      </div>
    </div>
  );
}
