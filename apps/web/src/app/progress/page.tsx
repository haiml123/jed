'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import Link from 'next/link';
import { Lock, Play, BookOpen, Sparkles, Clock, ArrowRight } from 'lucide-react';
import PageHeader from '@/components/ui/page-header';
import Badge from '@/components/ui/badge';

export default function ProgressPage() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<any[]>([]);
  const [xp, setXp] = useState(0);
  const [lessons, setLessons] = useState<any[]>([]);

  useEffect(() => {
    api.progress.list().then(setProgress).catch(console.error);
    api.progress.xp().then(d => setXp(d.totalXp)).catch(console.error);
    api.lessons.list().then(setLessons).catch(console.error);
  }, []);

  const totalUnits = lessons.reduce((sum: number, l: any) => sum + l.units.length, 0);
  const completedUnits = progress.filter((p: any) => p.quizCompleted).length;
  const progressPct = totalUnits > 0 ? Math.round((completedUnits / totalUnits) * 100) : 0;
  const userName = user?.email?.split('@')[0] || user?.name || 'Teacher';
  const getUnitProgress = (unitId: string) => progress.find((p: any) => p.unitId === unitId);

  const mandatoryLessons = lessons.filter(l => l.isMandatory);
  const optionalLessons = lessons.filter(l => !l.isMandatory);

  const getUnitProgressPct = (unitId: string) => {
    const unitProg = getUnitProgress(unitId);
    if (!unitProg) return 0;
    return Math.round(
      (unitProg.videoCompleted ? 33 : unitProg.videoWatchPercent > 0 ? Math.round(unitProg.videoWatchPercent * 0.33) : 0) +
      (unitProg.exitTicketSubmitted ? 33 : 0) +
      (unitProg.quizCompleted ? 34 : 0)
    );
  };

  return (
    <div className="p-6">
      <PageHeader label="MY PROGRESS" title="Progress Overview" />

      {/* Header row: mascot + speech bubble | progress summary */}
      <div className="flex gap-6 mb-8">
        {/* Left: Mascot + greeting */}
        <div className="flex items-start gap-3 flex-1">
          <Image
            src="/assets/home/jed-mascot-round.png"
            alt="JED Mascot"
            width={92}
            height={111}
            className="flex-shrink-0"
          />
          <div className="bg-[#ebf4fc] rounded-[14px] p-4 flex-1">
            <p className="text-xl text-[#333]">
              Great progress, {userName}! You&apos;re {progressPct}% through your learning journey.
            </p>
          </div>
        </div>

        {/* Right: Progress summary card */}
        <div className="bg-[#f1f4fb] rounded-[32px] p-6 w-[299px] flex-shrink-0">
          <p className="text-[30px] font-extrabold text-[#00609b] font-heading leading-none">{progressPct}%</p>
          <p className="text-sm text-[#707882] mt-1 mb-3 uppercase tracking-wide">Current Status</p>
          <div className="w-48 bg-[#dfe2e9] rounded-full h-2 mb-4">
            <div
              className="bg-[#00609b] rounded-full h-2 transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-white rounded-[20px] px-3 py-2 flex items-center gap-1.5">
              <span className="text-base font-extrabold text-[#111827] font-heading">{xp}</span>
              <span className="text-sm text-[#9ca3af]">XP</span>
            </div>
            <div className="bg-white rounded-[20px] px-3 py-2 flex items-center gap-1.5">
              <span className="text-base font-extrabold text-[#111827] font-heading">{completedUnits}/{totalUnits}</span>
              <span className="text-sm text-[#9ca3af]">Lessons</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content: Mandatory lessons + Optional sidebar */}
      <div className="flex gap-6">
        {/* Left: Mandatory Lessons */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1 h-7 bg-[#00609b] rounded-full" />
            <h3 className="font-heading text-2xl font-bold text-[#181c21]">Mandatory Lessons</h3>
          </div>

          <div className="space-y-4 mb-8">
            {mandatoryLessons.map((lesson: any) =>
              lesson.units.map((unit: any, idx: number) => {
                const unitProg = getUnitProgress(unit.id);
                const completed = unitProg?.quizCompleted;
                const unitProgressPct = getUnitProgressPct(unit.id);
                const isLocked = idx > 0 && !getUnitProgress(lesson.units[idx - 1]?.id)?.quizCompleted;
                const isFuture = idx > 1 && isLocked;

                /* Future / upcoming lesson card */
                if (isFuture) {
                  return (
                    <div key={unit.id} className="bg-[#f8f9fc] rounded-[32px] p-6 flex items-center gap-5 opacity-60">
                      <div className="w-16 h-16 rounded-full bg-[#e8eaf0] flex items-center justify-center flex-shrink-0">
                        <BookOpen size={20} className="text-[#b0b5bf]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-[#707882] mb-1 uppercase tracking-wide">
                          Unit {idx + 1} of {lesson.units.length}
                        </p>
                        <h4 className="font-heading text-xl font-bold text-[#181c21] italic">{unit.title}</h4>
                        <p className="text-sm text-[#707882] mt-1">
                          Upcoming topic in the Guided Explorer path.
                        </p>
                      </div>
                    </div>
                  );
                }

                /* Locked lesson card */
                if (isLocked) {
                  return (
                    <div key={unit.id} className="bg-[#f1f4fb] rounded-[32px] p-6 flex items-center gap-5">
                      <div className="w-16 h-16 rounded-full bg-[#dfe2e9] flex items-center justify-center flex-shrink-0">
                        <Lock size={20} className="text-[#707882]" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="locked">Locked</Badge>
                          <span className="text-xs text-[#707882] uppercase tracking-wide">Unit {idx + 1} of {lesson.units.length}</span>
                        </div>
                        <h4 className="font-heading text-xl font-bold text-[#181c21]">{unit.title}</h4>
                        <p className="text-sm text-[#404751] flex items-center gap-1.5 mt-1">
                          <Lock size={12} /> Complete previous lesson to unlock
                        </p>
                      </div>
                      <button
                        className="bg-[#d7dae1] text-[#707882] font-heading font-bold text-base px-5 py-3 rounded-full cursor-not-allowed"
                        disabled
                      >
                        Locked
                      </button>
                    </div>
                  );
                }

                /* Active / available lesson card */
                return (
                  <div key={unit.id} className="bg-white rounded-[32px] p-6 flex items-center gap-5">
                    <div className="w-16 h-16 rounded-full bg-[#ebf4fc] flex items-center justify-center flex-shrink-0">
                      <BookOpen size={24} className="text-[#00609b]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="required">Required</Badge>
                        <span className="text-xs text-[#707882] uppercase tracking-wide">{idx + 1} of {lesson.units.length} Unit</span>
                      </div>
                      <h4 className="font-heading text-[20px] font-bold text-[#181c21]">{lesson.title}</h4>
                      <p className="text-xs text-[#6b7280] mt-1">{lesson.description}</p>
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-[#9ca3af]">{unitProgressPct}%</span>
                        </div>
                        <div className="w-full bg-[#f3f4f6] rounded-full h-1">
                          <div
                            className="bg-[#1a6ebf] rounded-full h-1 transition-all"
                            style={{ width: `${unitProgressPct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Link
                        href={`/lesson/${lesson.id}/unit/${unit.id}`}
                        className="bg-[#00609b] hover:bg-[#004a79] text-white font-semibold text-sm px-5 py-3 rounded-full flex items-center gap-2 transition-colors"
                      >
                        <Play size={14} fill="white" /> Start Quest
                      </Link>
                      {lesson.dueDate && (
                        <span className="text-[10px] text-[#9ca3af] flex items-center gap-1">
                          <Clock size={10} /> Tomorrow, 10:00 AM
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right sidebar: Optional Lessons */}
        <div className="w-[374px] flex-shrink-0">
          <div className="bg-[#b548af] rounded-[32px] p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={18} className="text-white" />
              <h3 className="font-heading text-base font-semibold text-white">Optional Lessons</h3>
            </div>

            <div className="space-y-3">
              {optionalLessons.map((lesson: any) => {
                const lessonCompleted = progress.filter(
                  (p: any) => lesson.units.some((u: any) => u.id === p.unitId) && p.quizCompleted
                ).length;
                const lessonTotal = lesson.units.length;
                const lessonPct = lessonTotal > 0 ? Math.round((lessonCompleted / lessonTotal) * 100) : 0;

                return (
                  <div key={lesson.id} className="bg-white rounded-[32px] p-5">
                    <h5 className="font-heading text-base font-bold text-[#181c21] mb-1">{lesson.title}</h5>
                    <p className="text-xs text-[#6b7280] mb-3 leading-relaxed">{lesson.description}</p>
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-[#9ca3af]">
                          {lessonTotal > 0 ? `${lessonCompleted}/${lessonTotal} lessons` : '0 lessons'}
                        </span>
                        <span className="text-[10px] text-[#9ca3af]">{lessonPct}%</span>
                      </div>
                      <div className="w-full bg-[#f3f4f6] rounded-full h-1">
                        <div
                          className="bg-[#b548af] rounded-full h-1 transition-all"
                          style={{ width: `${lessonPct}%` }}
                        />
                      </div>
                    </div>
                    <Link
                      href={`/lesson/${lesson.id}/unit/${lesson.units[0]?.id}`}
                      className="inline-block bg-[#982d94] hover:bg-[#7a2478] text-white text-xs font-bold px-4 py-2 rounded-full transition-colors"
                    >
                      Start
                    </Link>
                  </div>
                );
              })}
            </div>

            {/* Explore All link */}
            <div className="mt-4 text-center">
              <Link
                href="/progress"
                className="text-sm font-bold text-white hover:underline inline-flex items-center gap-1"
              >
                EXPLORE ALL <ArrowRight size={14} />
              </Link>
            </div>

            {/* Info box */}
            <div className="bg-[#00609b] rounded-[32px] p-4 mt-4">
              <p className="text-xs font-medium text-white leading-relaxed">
                Electives can be taken at any time and do not affect your core curriculum path.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
