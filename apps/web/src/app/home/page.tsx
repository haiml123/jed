'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { PageHeader, StatCard, Badge } from '@/components/ui';
import {
  ArrowRight,
  Trophy,
  BookOpen,
  TrendingUp,
  CheckCircle,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Home Page                                                         */
/* ------------------------------------------------------------------ */
export default function HomePage() {
  const { user } = useAuth();
  const [lessons, setLessons] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [xp, setXp] = useState(0);
  const [engagement, setEngagement] = useState(0);

  useEffect(() => {
    api.lessons.list().then(setLessons).catch(console.error);
    api.progress.list().then(setProgress).catch(console.error);
    api.progress.xp().then((d) => setXp(d.totalXp)).catch(console.error);
    // Per Figma designer note: weekly engagement = 40% XP + 40% lessons + 20% logins
    api.progress.weeklyEngagement().then((d) => setEngagement(d.score)).catch(console.error);
  }, []);

  /* ---------- derived data ---------- */
  const totalUnits = lessons.reduce(
    (sum: number, l: any) => sum + (l.units?.length ?? 0),
    0,
  );
  const completedUnits = progress.filter((p: any) => p.quizCompleted).length;

  const getUnitProgress = (unitId: string) =>
    progress.find((p: any) => p.unitId === unitId);

  // First incomplete lesson / unit for "Continue where you left off"
  const currentLesson = lessons.find((l: any) =>
    l.units?.some((u: any) => !getUnitProgress(u.id)?.quizCompleted),
  );
  const currentUnit = currentLesson?.units?.find(
    (u: any) => !getUnitProgress(u.id)?.quizCompleted,
  );
  const currentUnitIndex = currentLesson?.units?.indexOf(currentUnit) ?? 0;
  const currentUnitProgress = currentUnit
    ? getUnitProgress(currentUnit.id)
    : null;
  const currentProgressPct = currentUnitProgress
    ? Math.round(
        (currentUnitProgress.videoCompleted ? 33 : 0) +
          (currentUnitProgress.exitTicketSubmitted ? 33 : 0) +
          (currentUnitProgress.quizCompleted ? 34 : 0),
      )
    : 0;

  const userName =
    user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'Teacher';
  const lessonProgressPct =
    totalUnits > 0 ? (completedUnits / totalUnits) * 100 : 0;

  /* ================================================================ */
  return (
    <div className="px-4 py-4 md:px-8 md:py-6 max-w-[1200px]">
      {/* ---------------------------------------------------------- */}
      {/* 1. Page Header                                              */}
      {/* ---------------------------------------------------------- */}
      <PageHeader label="Welcome, Teacher!" title="Teacher Dashboard" />

      {/* ---------------------------------------------------------- */}
      {/* 2. Hero Welcome Card                                        */}
      {/* ---------------------------------------------------------- */}
      <section className="bg-[#00609b] rounded-[32px] px-5 py-6 md:px-10 md:py-9 flex flex-col md:flex-row items-center justify-between mb-1 overflow-hidden relative gap-6 md:gap-0">
        {/* Left content */}
        <div className="max-w-[480px] space-y-4 z-10">
          <p className="text-[11px] font-bold text-[#d0e4ff] tracking-[0.12em] uppercase">
            Welcome back, {userName}
          </p>
          <h2 className="font-heading text-xl md:text-[35px] font-extrabold text-white leading-[1.15]">
            JEd is ready for your
            <br />
            next breakthrough.
          </h2>
          <Link
            href={
              currentLesson && currentUnit
                ? `/lesson/${currentLesson.id}/unit/${currentUnit.id}`
                : '#'
            }
            className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-bold text-[14px] px-6 py-3 rounded-full transition-colors border border-white/40"
          >
            Continue Learning
          </Link>
        </div>

        {/* Right: mascot + speech bubble */}
        <div className="flex-shrink-0 z-10 flex flex-col items-end gap-2 mr-2">
          <Image
            src="/assets/home/jed-mascot.png"
            alt="JED Mascot"
            width={176}
            height={176}
            className="rounded-full"
          />
          <div className="bg-[#ebf4fc] rounded-[14px] px-4 py-3 max-w-[300px] -mt-1">
            <p className="text-[12px] leading-[1.45] text-[#333]">
              Hey {userName}! Ready to keep the momentum going? Let&apos;s
              continue your learning journey today!
            </p>
          </div>
        </div>
      </section>

      {/* Last active line */}
      <p className="text-[10.5px] text-[#9ca3af] mb-6 mt-1.5">
        Last active: yesterday
      </p>

      {/* ---------------------------------------------------------- */}
      {/* 3. Stat Cards Row                                           */}
      {/* ---------------------------------------------------------- */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <StatCard
          label="Total XP"
          value={xp.toLocaleString()}
          icon={<Trophy size={18} className="text-white" />}
          color="#00609b"
          badge="+250 today"
          badgeColor="#2f6c00"
        />

        <StatCard
          label="Lessons Completed"
          value={`${completedUnits}/${totalUnits}`}
          icon={<BookOpen size={18} className="text-white" />}
          color="#982d94"
          progress={lessonProgressPct}
          progressColor="#982d94"
        />

        <StatCard
          label="Weekly Progress/ Engagement"
          value={`${engagement}%`}
          icon={<TrendingUp size={18} className="text-white" />}
          color="#2f6c00"
        />
      </section>

      {/* ---------------------------------------------------------- */}
      {/* 4. Continue Where You Left Off                               */}
      {/* ---------------------------------------------------------- */}
      {currentLesson && currentUnit && (
        <section className="mb-8">
          <div className="mb-3">
            <h3 className="font-heading text-[17.5px] font-extrabold text-[#181c21]">
              Continue where you left off
            </h3>
            <p className="text-[13px] text-[#6b7280]">
              Pick up from your last session.
            </p>
          </div>

          <div className="bg-[#f1f4fb] rounded-[32px] p-4 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8">
            {/* Lesson cover image */}
            <Image
              src="/assets/lessons/classroom-management.png"
              alt="Lesson cover"
              width={278}
              height={209}
              className="rounded-[14px] object-cover flex-shrink-0 w-full md:w-[278px] h-auto md:h-[209px]"
            />

            {/* Lesson details */}
            <div className="flex-1 space-y-3">
              {/* Badges row */}
              <div className="flex items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 bg-[#ffdad6] text-[#93000a] text-[11px] font-bold px-3 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#93000a]" />
                  Due in 3 days
                </span>
                {currentLesson.isMandatory && (
                  <Badge variant="mandatory">MANDATORY</Badge>
                )}
              </div>

              {/* Title & description */}
              <h3 className="font-heading text-xl md:text-[32px] font-extrabold text-[#181c21] leading-tight">
                {currentLesson.title}
              </h3>
              <p className="text-[15px] text-[#404751] leading-relaxed">
                {currentLesson.description}
              </p>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-bold text-[#00609b]">
                    Progress: {currentProgressPct}% Completed
                  </span>
                  <span className="text-[13px] font-bold text-[#707882]">
                    Unit {currentUnitIndex + 1} of{' '}
                    {currentLesson.units?.length}
                  </span>
                </div>
                <div className="w-full bg-white rounded-full h-3.5 shadow-sm">
                  <div
                    className="bg-[#00609b] rounded-full h-3.5 transition-all"
                    style={{ width: `${currentProgressPct}%` }}
                  />
                </div>
              </div>

              {/* Continue button */}
              <Link
                href={`/lesson/${currentLesson.id}/unit/${currentUnit.id}`}
                className="inline-flex items-center gap-2 bg-[#00609b] hover:bg-[#004a79] text-white font-bold text-[15px] px-7 py-3 rounded-full transition-colors mt-1"
              >
                Continue <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ---------------------------------------------------------- */}
      {/* 5. Achievements & Milestones                                */}
      {/* ---------------------------------------------------------- */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Recent Achievements */}
        <div>
          <h4 className="font-heading text-[17px] font-bold text-[#181c21] mb-3">
            Recent Achievements
          </h4>
          <div className="space-y-3">
            {/* Achievement card 1 */}
            <div className="bg-white rounded-[32px] p-5 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#dcfce7] flex items-center justify-center flex-shrink-0">
                <CheckCircle size={22} className="text-[#2f6c00]" />
              </div>
              <div>
                <h5 className="font-heading text-[15px] font-bold text-[#181c21]">
                  Assessment &amp; Feedback
                </h5>
                <p className="text-[13px] text-[#707882]">
                  Completed the Socratic Method certification.
                </p>
              </div>
            </div>

            {/* Achievement card 2 */}
            <div className="bg-white rounded-[32px] p-5 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#f3e8ff] flex items-center justify-center flex-shrink-0">
                <TrendingUp size={22} className="text-[#982d94]" />
              </div>
              <div>
                <h5 className="font-heading text-[15px] font-bold text-[#181c21]">
                  Fast Track
                </h5>
                <p className="text-[13px] text-[#707882]">
                  Finished 5 lessons in under 48 hours.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Milestones */}
        <div>
          <h4 className="font-heading text-[17px] font-bold text-[#181c21] mb-3">
            Upcoming Milestones
          </h4>
          <div className="bg-white rounded-[32px] p-6 space-y-5">
            {/* Milestone 1: In Progress */}
            <div className="flex items-start gap-3">
              <span className="mt-1 w-2.5 h-2.5 rounded-full bg-[#00609b] flex-shrink-0" />
              <div>
                <span className="text-[11px] font-bold text-[#00609b] tracking-wide uppercase">
                  In Progress
                </span>
                <h5 className="font-heading text-[15px] font-bold text-[#181c21] mt-0.5">
                  Pedagogy Final Exam
                </h5>
                <p className="text-[13px] text-[#707882]">
                  Unlock the &quot;Senior Educator&quot; badge.
                </p>
              </div>
            </div>

            {/* Milestone 2: Locked */}
            <div className="flex items-start gap-3">
              <span className="mt-1 w-2.5 h-2.5 rounded-full bg-[#9ca3af] flex-shrink-0" />
              <div>
                <span className="text-[11px] font-bold text-[#9ca3af] tracking-wide uppercase">
                  Locked
                </span>
                <h5 className="font-heading text-[15px] font-bold text-[#181c21] mt-0.5">
                  Digital Literacy Workshop
                </h5>
                <p className="text-[13px] text-[#707882]">
                  Requires Level 5 completion.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
