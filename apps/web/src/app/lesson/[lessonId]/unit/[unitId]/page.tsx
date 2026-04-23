'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { api } from '@/lib/api';
import { PawBackground } from '@/components/ui';
import {
  ArrowLeft,
  Play,
  AlertTriangle,
  BookOpen,
  CheckCircle,
  Flame,
  ChevronRight,
} from 'lucide-react';

/* ────────────────────────────────────────────────────────────
   Types
   ──────────────────────────────────────────────────────────── */

type Step =
  | 'video'
  | 'exit-ticket'
  | 'quiz'
  | 'quiz-review'
  | 'complete'
  | 'reflection';

interface QuizOption {
  id: string;
  text: string;
  isCorrect?: boolean;
}

interface QuizQuestion {
  id: string;
  text: string;
  options: QuizOption[];
  explanation?: string;
}

/* ────────────────────────────────────────────────────────────
   Page Component
   ──────────────────────────────────────────────────────────── */

export default function LessonUnitPage() {
  const { lessonId, unitId } = useParams<{ lessonId: string; unitId: string }>();
  const router = useRouter();

  /* ── data ── */
  const [lesson, setLesson] = useState<any>(null);
  const [unit, setUnit] = useState<any>(null);
  const [xp, setXp] = useState(0);

  /* ── navigation ── */
  const [step, setStep] = useState<Step>('video');

  /* ── video ── */
  const [videoPercent, setVideoPercent] = useState(0);
  const [videoPlaying, setVideoPlaying] = useState(false);

  /* ── exit ticket ── */
  const [exitResponse, setExitResponse] = useState('');
  const [shareWithDirector, setShareWithDirector] = useState(false);

  /* ── quiz ── */
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answerState, setAnswerState] = useState<'unanswered' | 'correct' | 'wrong'>('unanswered');
  const [answeredQuestions, setAnsweredQuestions] = useState<Record<string, string>>({});

  /* ── results ── */
  const [quizResult, setQuizResult] = useState<any>(null);
  const [xpBreakdown, setXpBreakdown] = useState({ exitTicket: 10, quiz: 0 });

  /* ── reflection ── */
  const [reflectionText, setReflectionText] = useState('');
  const [reflectionShare, setReflectionShare] = useState(false);

  /* ── loading ── */
  const [loading, setLoading] = useState(false);

  /* ────────────────────────────────────────────────────────────
     Data fetching
     ──────────────────────────────────────────────────────────── */

  useEffect(() => {
    api.lessons
      .get(lessonId)
      .then((l) => {
        setLesson(l);
        const u = l.units.find((u: any) => u.id === unitId);
        setUnit(u);
      })
      .catch(console.error);

    api.progress
      .xp()
      .then((d) => setXp(d.totalXp))
      .catch(console.error);
  }, [lessonId, unitId]);

  /* ── derived ── */
  const unitIndex = lesson?.units.findIndex((u: any) => u.id === unitId) ?? 0;
  const totalUnits = lesson?.units.length ?? 1;
  const isLastUnit = unitIndex >= totalUnits - 1;
  const questions: QuizQuestion[] = unit?.quizQuestions ?? [];
  const currentQ = questions[currentQuestion] ?? null;

  const stepNumber = step === 'video' ? 1 : step === 'exit-ticket' ? 2 : 3;
  const stepLabel =
    step === 'complete'
      ? 'Lesson Complete'
      : step === 'reflection'
        ? 'Quest Complete'
        : `Step ${stepNumber} of 3`;

  /* ────────────────────────────────────────────────────────────
     Video
     ──────────────────────────────────────────────────────────── */

  const handlePlayVideo = useCallback(() => {
    if (videoPlaying) return;
    setVideoPlaying(true);
    let pct = 0;
    const interval = setInterval(() => {
      pct += 5;
      setVideoPercent(pct);
      if (pct >= 100) {
        clearInterval(interval);
        setVideoPlaying(false);
        api.progress
          .updateVideo(unitId, 100)
          .then(() => setXp((prev) => prev + 10))
          .catch(console.error);
      }
    }, 200);
  }, [unitId, videoPlaying]);

  /* ────────────────────────────────────────────────────────────
     Exit ticket
     ──────────────────────────────────────────────────────────── */

  const handleExitTicketSubmit = async () => {
    if (!exitResponse.trim() || loading) return;
    setLoading(true);
    try {
      await api.progress.submitExitTicket(unitId, exitResponse, shareWithDirector);
      setStep('quiz');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  /* ────────────────────────────────────────────────────────────
     Quiz
     ──────────────────────────────────────────────────────────── */

  const handleSelectOption = (optionId: string) => {
    if (answerState !== 'unanswered') return;
    setSelectedOption(optionId);
  };

  const handleConfirmAnswer = () => {
    if (!selectedOption || !currentQ) return;
    const chosen = currentQ.options.find((o) => o.id === selectedOption);
    const isCorrect = chosen?.isCorrect === true;
    setAnswerState(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) {
      setAnsweredQuestions((prev) => ({ ...prev, [currentQ.id]: selectedOption }));
    }
  };

  const handleTryAgain = () => {
    setSelectedOption(null);
    setAnswerState('unanswered');
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedOption(null);
      setAnswerState('unanswered');
    }
  };

  const handleSeeResults = async () => {
    setLoading(true);
    try {
      const answers = Object.entries(answeredQuestions).map(([questionId, optionId]) => ({
        questionId,
        optionId,
      }));
      const result = await api.progress.submitQuiz(unitId, answers);
      setQuizResult(result);
      setXpBreakdown({ exitTicket: 10, quiz: result?.xpEarned ?? 20 });
      setXp((prev) => prev + (result?.xpEarned ?? 0));
      setStep('complete');
    } catch (e) {
      console.error(e);
      setStep('complete');
    } finally {
      setLoading(false);
    }
  };

  /* ────────────────────────────────────────────────────────────
     Reflection
     ──────────────────────────────────────────────────────────── */

  const handleReflectionSubmit = async () => {
    if (!reflectionText.trim() || loading) return;
    setLoading(true);
    try {
      await api.progress.submitReflection(unitId, reflectionText, reflectionShare);
      router.push('/home');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  /* ────────────────────────────────────────────────────────────
     Loading state
     ──────────────────────────────────────────────────────────── */

  if (!lesson || !unit) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  /* ────────────────────────────────────────────────────────────
     Helpers for option styling in quiz
     ──────────────────────────────────────────────────────────── */

  const getOptionClasses = (opt: QuizOption) => {
    const base =
      'w-full text-left p-4 rounded-[14px] border-2 text-sm transition-all flex items-center gap-3';

    if (answerState === 'unanswered') {
      if (selectedOption === opt.id) {
        return `${base} border-primary bg-primary-light text-primary font-medium`;
      }
      return `${base} border-border bg-white hover:border-primary/40 text-text-dark`;
    }

    // After answering
    if (opt.isCorrect) {
      return `${base} border-accent-green bg-green-50 text-green-800 font-medium`;
    }
    if (selectedOption === opt.id && !opt.isCorrect) {
      return `${base} border-red-400 bg-red-50 text-red-700 font-medium`;
    }
    return `${base} border-border bg-white text-muted-dark opacity-60`;
  };

  const getRadioClasses = (opt: QuizOption) => {
    if (answerState === 'unanswered') {
      if (selectedOption === opt.id) {
        return 'w-5 h-5 rounded-full border-2 border-primary bg-primary flex items-center justify-center flex-shrink-0';
      }
      return 'w-5 h-5 rounded-full border-2 border-border-dark flex-shrink-0';
    }
    if (opt.isCorrect) {
      return 'w-5 h-5 rounded-full border-2 border-accent-green bg-accent-green flex items-center justify-center flex-shrink-0';
    }
    if (selectedOption === opt.id && !opt.isCorrect) {
      return 'w-5 h-5 rounded-full border-2 border-red-400 bg-red-400 flex items-center justify-center flex-shrink-0';
    }
    return 'w-5 h-5 rounded-full border-2 border-border-dark flex-shrink-0 opacity-60';
  };

  /* ════════════════════════════════════════════════════════════
     RENDER
     ════════════════════════════════════════════════════════════ */

  return (
    <div className="min-h-screen bg-surface relative">
      <PawBackground />

      {/* ───── Header ───── */}
      <header className="relative z-10 bg-white border-b border-border px-6 h-14 flex items-center justify-between">
        <button
          onClick={() => router.push('/home')}
          className="flex items-center gap-1.5 text-text-heading text-[13px] font-semibold hover:opacity-70 transition-opacity"
        >
          <ArrowLeft size={16} />
          Exit
        </button>

        <div className="flex items-center gap-1.5 bg-[#ebf4fc] rounded-full px-3.5 py-1.5">
          <Flame size={14} className="text-primary" />
          <span className="text-[13px] font-bold text-text-heading">{xp} XP</span>
        </div>

        <span className="text-[13px] font-semibold text-muted-dark">{stepLabel}</span>
      </header>

      {/* ───── Content ───── */}
      <div className="relative z-10">
        {/* ═══════════════════════════════════════════
           STEP: VIDEO
           ═══════════════════════════════════════════ */}
        {step === 'video' && (
          <div className="p-6">
            <p className="text-xs font-semibold text-muted-dark mb-5 tracking-wide">
              {unitIndex + 1} of {totalUnits} UNIT
            </p>

            <div className="flex gap-5">
              {/* Left - Video Player Card */}
              <div className="flex-1 min-w-0">
                <div className="bg-white rounded-[14px] border border-border overflow-hidden">
                  {/* Video area */}
                  <div
                    className="relative bg-[#e5e7eb] aspect-video flex items-center justify-center cursor-pointer"
                    onClick={handlePlayVideo}
                  >
                    {videoPercent === 0 ? (
                      <div className="text-center">
                        <div className="w-[70px] h-[70px] rounded-full bg-[#9ca3af] border-2 border-[#7c8494] flex items-center justify-center mx-auto mb-3">
                          <Play size={32} className="text-white ml-1" fill="white" />
                        </div>
                        <p className="text-xs text-[#6b7280] font-medium">Click to play video</p>
                      </div>
                    ) : videoPercent < 100 ? (
                      <div className="text-center">
                        <div className="w-20 h-20 rounded-full border-4 border-primary flex items-center justify-center">
                          <span className="text-2xl font-bold text-primary">{videoPercent}%</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <CheckCircle size={48} className="text-accent-green mx-auto mb-2" />
                        <p className="text-sm font-semibold text-accent-green">Video Complete!</p>
                      </div>
                    )}
                  </div>

                  {/* Video controls bar */}
                  <div className="px-4 py-3 bg-[#374151]">
                    <div className="w-full bg-[#4b5563] rounded-full h-1 mb-2.5">
                      <div
                        className="bg-[#9ca3af] rounded-full h-1 transition-all duration-200"
                        style={{ width: `${videoPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-[#d1d5db]">
                      <span>
                        {Math.floor((videoPercent / 100) * 4)}:
                        {String(Math.floor(((videoPercent / 100) * 240) % 60)).padStart(2, '0')} /
                        4:00
                      </span>
                      <span>{videoPercent}% complete</span>
                    </div>
                  </div>

                  {/* Skip + Tip below video */}
                  <div className="p-5">
                    <button
                      onClick={() => setStep('exit-ticket')}
                      className="w-full bg-primary hover:bg-primary-dark text-white font-semibold text-[13px] py-2.5 rounded-full transition-colors"
                    >
                      Skip and Continue to Exit Ticket
                    </button>

                    <div className="bg-[#f3f4f6] rounded-panel p-4 mt-4 flex items-start gap-2.5">
                      <AlertTriangle
                        size={18}
                        className="text-accent-amber flex-shrink-0 mt-0.5"
                      />
                      <p className="text-xs font-bold text-text-dark leading-relaxed">
                        Tip: Watching the full video earns you{' '}
                        <span className="text-primary">+10 XP</span> and helps you succeed in the
                        quiz!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right - Key Takeaways Sidebar */}
              <div className="w-[461px] flex-shrink-0">
                <div className="bg-white rounded-panel border border-border-dark p-6">
                  <div className="flex items-center gap-2.5 mb-5">
                    <BookOpen size={18} className="text-muted-darker" />
                    <h3 className="font-heading text-[15.75px] font-semibold text-text-heading">
                      Key Takeaways
                    </h3>
                  </div>

                  <div className="space-y-4 mb-6">
                    {unit.keyTakeaways?.map((kt: any, i: number) => (
                      <div key={kt.id} className="flex items-start gap-3">
                        <div className="w-[22px] h-[22px] rounded-full bg-[#e5e7eb] flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-[11px] font-semibold text-text-heading">
                            {i + 1}
                          </span>
                        </div>
                        <p className="text-[12.5px] text-text-heading leading-relaxed">
                          {kt.text}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-border-light pt-5">
                    <h4 className="font-heading text-sm font-semibold text-muted-darker mb-4">
                      What&apos;s Next
                    </h4>
                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-darker">Quiz Questions</span>
                        <span className="font-semibold text-text-dark">
                          {questions.length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-darker">Total Time</span>
                        <span className="font-semibold text-text-dark">~10 min</span>
                      </div>
                      <div className="flex justify-between border-t border-[#f3f4f6] pt-2.5 mt-2.5">
                        <span className="text-muted-darker">Max XP Available</span>
                        <span className="text-[14px] font-bold text-text-dark">100 XP</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════
           STEP: EXIT TICKET
           ═══════════════════════════════════════════ */}
        {step === 'exit-ticket' && (
          <div className="p-6">
            <div className="flex gap-5">
              {/* Left: shrunken video player */}
              <div className="w-[340px] flex-shrink-0">
                <div className="bg-white rounded-[14px] border border-border overflow-hidden">
                  <div className="relative bg-[#e5e7eb] aspect-video flex items-center justify-center">
                    {videoPercent >= 100 ? (
                      <CheckCircle size={32} className="text-accent-green" />
                    ) : (
                      <div className="w-[50px] h-[50px] rounded-full bg-[#9ca3af] border-2 border-[#7c8494] flex items-center justify-center">
                        <Play size={22} className="text-white ml-0.5" fill="white" />
                      </div>
                    )}
                  </div>
                  <div className="px-3 py-2 bg-[#374151]">
                    <div className="w-full bg-[#4b5563] rounded-full h-0.5 mb-1.5">
                      <div
                        className="bg-[#9ca3af] rounded-full h-0.5"
                        style={{ width: `${videoPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] text-[#d1d5db]">
                      <span>0:00 / 4:00</span>
                      <span>{videoPercent}%</span>
                    </div>
                  </div>
                  <div className="p-3">
                    <button
                      onClick={() => setStep('video')}
                      className="w-full bg-primary hover:bg-primary-dark text-white font-semibold text-[11px] py-2 rounded-full transition-colors"
                    >
                      Skip and Continue to Exit Ticket
                    </button>
                    <div className="bg-[#f3f4f6] rounded-[14px] p-3 mt-2.5 flex items-start gap-2">
                      <AlertTriangle size={14} className="text-accent-amber flex-shrink-0 mt-0.5" />
                      <p className="text-[10px] font-bold text-text-dark leading-relaxed">
                        Tip: Watching the full video earns you +10 XP and helps you succeed in the
                        quiz!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Exit Ticket Form */}
              <div className="flex-1 min-w-0">
                <div className="bg-white rounded-card border border-border p-8 max-w-[600px]">
                  {/* XP badge */}
                  <div className="flex items-center gap-1.5 bg-[#ebf4fc] rounded-full px-3 py-1 w-fit mb-5">
                    <Flame size={13} className="text-primary" />
                    <span className="text-[12px] font-bold text-text-heading">{xp} XP</span>
                  </div>

                  {/* Heading */}
                  <h2 className="font-heading text-[17.5px] font-semibold text-text-dark">
                    Exit Ticket
                  </h2>
                  <p className="text-[13px] text-muted-dark mt-0.5">
                    {lesson.title} &bull; Step 2 of 3
                  </p>

                  {/* Green encouragement box */}
                  <div className="mt-5 bg-[#f0fdf4] border border-[#bbf7d0] rounded-panel p-4 flex items-start gap-3">
                    <span className="text-lg">&#9989;</span>
                    <div>
                      <p className="font-semibold text-[13px] text-[#166534]">
                        Great work on the video!
                      </p>
                      <p className="text-[12px] text-[#15803d] mt-0.5">
                        Before the quiz, reflect on what you learned and how you&apos;ll use it.
                      </p>
                    </div>
                  </div>

                  {/* EXIT TICKET card */}
                  <div className="mt-5">
                    <div className="bg-primary text-white font-heading text-[14px] font-bold px-5 py-2.5 rounded-t-card tracking-wide">
                      EXIT TICKET
                    </div>
                    <div className="border border-t-0 border-border rounded-b-card p-5">
                      <p className="text-[12px] text-muted-dark mb-2 font-medium">
                        Reflect on what you learned
                      </p>
                      <textarea
                        value={exitResponse}
                        onChange={(e) => setExitResponse(e.target.value)}
                        placeholder="What did you learn? How will you apply this in your classroom?"
                        className="w-full h-28 p-3.5 rounded-card border border-border text-[13px] text-text resize-none focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none placeholder:text-muted transition-colors"
                      />

                      {/*
                        Per Figma designer note:
                        - Mandatory lessons: automatically shared with director (no checkbox)
                        - Optional lessons: teacher opts in via this checkbox
                      */}
                      {lesson.isMandatory ? (
                        <p className="mt-3 text-[11px] text-[#6b7280] flex items-center gap-1.5">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent-green" />
                          This reflection will be automatically shared with your director.
                        </p>
                      ) : (
                        <label className="flex items-center gap-2.5 mt-3 text-[12px] text-muted-dark cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={shareWithDirector}
                            onChange={(e) => setShareWithDirector(e.target.checked)}
                            className="w-4 h-4 rounded border-border-dark text-primary focus:ring-primary"
                          />
                          Share this reflection with my director
                        </label>
                      )}

                      <button
                        onClick={handleExitTicketSubmit}
                        disabled={!exitResponse.trim() || loading}
                        className="w-full mt-5 bg-primary text-white font-semibold text-[13.5px] py-3 rounded-full hover:bg-primary-dark disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        ) : (
                          <>
                            Submit &amp; Continue to Quiz
                            <ChevronRight size={16} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════
           STEP: QUIZ
           ═══════════════════════════════════════════ */}
        {step === 'quiz' && currentQ && (
          <div className="px-6 py-8 max-w-[720px] mx-auto">
            {/* Mascot */}
            <div className="flex justify-center mb-4">
              <Image
                src="/assets/home/jed-mascot.png"
                alt="JEd mascot"
                width={80}
                height={80}
                className="object-contain"
              />
            </div>

            {/* Step indicator */}
            <p className="text-center text-[12px] text-muted-dark font-medium mb-3">
              Step 3 of 3
            </p>

            {/* Question */}
            <h2 className="text-center font-heading text-[18px] font-bold text-primary mb-8 max-w-[540px] mx-auto leading-snug">
              {currentQ.text}
            </h2>

            {/* Options */}
            <div className="space-y-3 mb-6">
              {currentQ.options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(opt.id)}
                  className={getOptionClasses(opt)}
                  disabled={answerState !== 'unanswered'}
                >
                  <div className={getRadioClasses(opt)}>
                    {((answerState !== 'unanswered' && opt.isCorrect) ||
                      (selectedOption === opt.id && answerState === 'unanswered')) && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                    {selectedOption === opt.id &&
                      answerState === 'wrong' &&
                      !opt.isCorrect && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                  </div>
                  <span>{opt.text}</span>
                </button>
              ))}
            </div>

            {/* Mascot feedback for wrong answer */}
            {answerState === 'wrong' && (
              <div className="bg-white rounded-panel border border-border p-5 mb-6">
                <div className="flex items-start gap-4">
                  <Image
                    src="/assets/home/jed-mascot-round.png"
                    alt="JEd"
                    width={50}
                    height={50}
                    className="rounded-full flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-text-dark mb-1">JEd Says:</p>
                    <p className="text-[12px] text-muted-dark leading-relaxed">
                      {currentQ.explanation ||
                        "That's not quite right. Think about the key concepts from the video and try again."}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-4 ml-[66px]">
                  <button
                    onClick={handleTryAgain}
                    className="bg-primary text-white font-semibold text-[13px] px-6 py-2.5 rounded-full hover:bg-primary-dark transition-colors"
                  >
                    Try Again
                  </button>
                  <button className="text-primary text-[13px] font-semibold hover:underline">
                    Learn More
                  </button>
                </div>
              </div>
            )}

            {/* Mascot feedback for correct answer */}
            {answerState === 'correct' && (
              <div className="bg-white rounded-panel border border-border p-5 mb-6">
                <div className="flex items-start gap-4">
                  <Image
                    src="/assets/home/jed-mascot-round.png"
                    alt="JEd"
                    width={50}
                    height={50}
                    className="rounded-full flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-text-dark mb-1">
                      <span className="text-accent-green">&#10003; Correct!</span>
                    </p>
                    <p className="text-[12px] text-muted-dark leading-relaxed">
                      {currentQ.explanation ||
                        'Great job! You got it right.'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-4 ml-[66px]">
                  {currentQuestion < questions.length - 1 ? (
                    <button
                      onClick={handleNextQuestion}
                      className="bg-primary text-white font-semibold text-[13px] px-6 py-2.5 rounded-full hover:bg-primary-dark transition-colors flex items-center gap-1.5"
                    >
                      Next Question
                      <ChevronRight size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={handleSeeResults}
                      disabled={loading}
                      className="bg-primary text-white font-semibold text-[13px] px-6 py-2.5 rounded-full hover:bg-primary-dark disabled:opacity-50 transition-colors"
                    >
                      {loading ? 'Loading...' : 'See Results'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Confirm answer button (before submitting) */}
            {answerState === 'unanswered' && selectedOption && (
              <div className="flex justify-center">
                <button
                  onClick={handleConfirmAnswer}
                  className="bg-primary text-white font-semibold text-[13px] px-8 py-2.5 rounded-full hover:bg-primary-dark transition-colors"
                >
                  Submit Answer
                </button>
              </div>
            )}

            {/* Progress dots */}
            <div className="flex items-center justify-center gap-2 mt-8">
              {questions.map((_, i) => (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    i === currentQuestion
                      ? 'bg-primary'
                      : i < currentQuestion
                        ? 'bg-accent-green'
                        : 'bg-border'
                  }`}
                />
              ))}
            </div>
            <p className="text-center text-[11px] text-muted mt-2">
              &#128274; Progress automatically saved
            </p>
          </div>
        )}

        {/* ═══════════════════════════════════════════
           STEP: COMPLETE
           ═══════════════════════════════════════════ */}
        {step === 'complete' && (
          <div className="px-6 py-10 max-w-[580px] mx-auto relative">
            {/* Confetti overlay — per Figma Apr 22 update (node 552:2998).
                Rendered absolutely so it doesn't affect layout, fades out
                after the initial appearance. */}
            <Image
              src="/assets/home/confetti.png"
              alt=""
              width={520}
              height={520}
              aria-hidden
              className="absolute left-1/2 top-0 -translate-x-1/2 pointer-events-none opacity-80 animate-[fadeOut_2.5s_ease-out_forwards]"
            />
            <div className="text-center mb-8 relative">
              <h1 className="font-heading text-[26px] font-bold text-text-dark">
                Lesson Complete
              </h1>
              <p className="text-[14px] text-muted-dark mt-1">{lesson.title}</p>
            </div>

            {/* XP Earned */}
            <div className="bg-white rounded-panel border border-border p-6 mb-6 text-center">
              <p className="text-[12px] text-muted-dark font-medium uppercase tracking-wider mb-2">
                XP Earned This Lesson
              </p>
              <p className="text-[48px] font-bold text-primary leading-none mb-5">
                +{xpBreakdown.exitTicket + xpBreakdown.quiz}
              </p>

              {/* Breakdown */}
              <div className="space-y-3 text-left max-w-[340px] mx-auto">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle size={18} className="text-accent-green" />
                    <span className="text-[13px] text-text-dark">Submitted Exit Ticket</span>
                  </div>
                  <span className="text-[13px] font-semibold text-primary">
                    +{xpBreakdown.exitTicket} XP
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle size={18} className="text-accent-green" />
                    <span className="text-[13px] text-text-dark">Quiz Score</span>
                  </div>
                  <span className="text-[13px] font-semibold text-primary">
                    +{xpBreakdown.quiz} XP
                  </span>
                </div>
              </div>

              {/* Total XP */}
              <div className="border-t border-border-light mt-5 pt-4">
                <div className="flex items-center justify-between max-w-[340px] mx-auto">
                  <span className="text-[13px] text-muted-dark font-medium">Total XP</span>
                  <span className="text-[20px] font-bold text-text-dark">{xp}</span>
                </div>
              </div>
            </div>

            {/* Quest progress */}
            <div className="bg-white rounded-panel border border-border p-6 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle size={16} className="text-accent-green" />
                <span className="text-[14px] font-semibold text-text-dark">
                  {lesson.questTitle || lesson.title}
                </span>
              </div>
              <p className="text-[12px] text-muted-dark mb-2">
                Lessons completed in this Quest
              </p>
              <div className="w-full bg-border-light rounded-full h-2.5">
                <div
                  className="bg-primary rounded-full h-2.5 transition-all"
                  style={{
                    width: `${Math.min(100, ((unitIndex + 1) / totalUnits) * 100)}%`,
                  }}
                />
              </div>
              <p className="text-[11px] text-muted-dark mt-1.5 text-right">
                {unitIndex + 1}/{totalUnits}
              </p>
            </div>

            {/* Mascot speech bubble */}
            <div className="flex items-start gap-4 mb-8">
              <Image
                src="/assets/home/jed-mascot.png"
                alt="JEd mascot"
                width={64}
                height={64}
                className="object-contain flex-shrink-0"
              />
              <div className="bg-white rounded-panel border border-border p-4 flex-1 relative">
                <p className="text-[13px] text-text-dark leading-relaxed">
                  <span className="font-bold">Paw-fect work!</span>{' '}
                  You did it! I&apos;m so proud! Keep every step forward in mind as you keep
                  growing &mdash; you&apos;re becoming a better teacher every day!
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              {isLastUnit ? (
                <button
                  onClick={() => setStep('reflection')}
                  className="w-full bg-accent-green text-white font-semibold text-[14px] py-3.5 rounded-full hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  Continue to Quest Reflection
                  <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  onClick={() =>
                    router.push(
                      `/lesson/${lessonId}/unit/${lesson.units[unitIndex + 1]?.id}`
                    )
                  }
                  className="w-full bg-accent-green text-white font-semibold text-[14px] py-3.5 rounded-full hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  Continue to Next Lesson
                  <ChevronRight size={18} />
                </button>
              )}
              <button
                onClick={() => router.push('/home')}
                className="w-full text-muted-dark font-medium text-[13px] py-2 hover:text-text-dark transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════
           STEP: REFLECTION (Quest Complete)
           ═══════════════════════════════════════════ */}
        {step === 'reflection' && (
          <div className="px-6 py-10 max-w-[600px] mx-auto">
            <div className="text-center mb-6">
              <h1 className="font-heading text-[26px] font-bold text-text-dark">
                Quest Complete!
              </h1>
              <p className="text-[14px] text-muted-dark mt-1">
                {lesson.questTitle || 'Classroom Management Mastery'}
              </p>
              <p className="text-[12px] text-muted mt-1">
                {totalUnits} lessons completed &bull; {xp} XP earned
              </p>
            </div>

            {/* Mascot speech bubble */}
            <div className="flex items-start gap-4 mb-8">
              <Image
                src="/assets/home/jed-mascot.png"
                alt="JEd mascot"
                width={64}
                height={64}
                className="object-contain flex-shrink-0"
              />
              <div className="bg-[#ebf4fc] rounded-panel p-4 flex-1">
                <p className="text-[13px] font-bold text-text-dark mb-1">
                  Woof woof! You&apos;re on fire!
                </p>
                <p className="text-[12px] text-muted-dark leading-relaxed">
                  Completing a whole quest is a HUGE achievement. You&apos;ve put in
                  amazing work going through the professional learning series. Take a
                  moment to reflect on what you&apos;ve learned.
                </p>
              </div>
            </div>

            {/* Reflection card */}
            <div className="bg-white rounded-panel border border-border overflow-hidden">
              <div className="bg-primary text-white font-heading text-[14px] font-bold px-5 py-2.5 tracking-wide">
                YOUR REFLECTION
              </div>
              <div className="p-6">
                <p className="text-[12px] text-muted-dark mb-3 leading-relaxed">
                  Reflect on your learning journey through the entire unit.
                </p>
                <textarea
                  value={reflectionText}
                  onChange={(e) => setReflectionText(e.target.value)}
                  placeholder="What were your biggest takeaways from this quest? How has your teaching practice evolved? What will you do differently in your classroom?"
                  className="w-full h-32 p-3.5 rounded-card border border-border text-[13px] text-text resize-none focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none placeholder:text-muted transition-colors"
                />

                <label className="flex items-center gap-2.5 mt-3 text-[12px] text-muted-dark cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={reflectionShare}
                    onChange={(e) => setReflectionShare(e.target.checked)}
                    className="w-4 h-4 rounded border-border-dark text-primary focus:ring-primary"
                  />
                  Share this reflection with my director
                </label>

                <button
                  onClick={handleReflectionSubmit}
                  disabled={!reflectionText.trim() || loading}
                  className="w-full mt-5 bg-primary text-white font-semibold text-[14px] py-3 rounded-full hover:bg-primary-dark disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <>
                      Submit Reflection
                      <span className="text-base">&#128062;</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
