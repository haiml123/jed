import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProgressService {
  constructor(private prisma: PrismaService) {}

  async getProgress(userId: string) {
    return this.prisma.lessonProgress.findMany({
      where: { userId },
      include: { unit: { include: { lesson: true } } },
    });
  }

  async updateVideoProgress(userId: string, unitId: string, watchPercent: number) {
    const videoCompleted = watchPercent >= 90;
    const xpBonus = videoCompleted ? 10 : 0;

    return this.prisma.lessonProgress.upsert({
      where: { userId_unitId: { userId, unitId } },
      create: { userId, unitId, videoWatchPercent: watchPercent, videoCompleted, xpEarned: xpBonus },
      update: {
        videoWatchPercent: watchPercent,
        videoCompleted,
        xpEarned: { increment: videoCompleted ? xpBonus : 0 },
      },
    });
  }

  async submitExitTicket(userId: string, unitId: string, response: string, shareWithDirector: boolean) {
    const progress = await this.prisma.lessonProgress.upsert({
      where: { userId_unitId: { userId, unitId } },
      create: { userId, unitId, exitTicketResponse: response, exitTicketSubmitted: true, xpEarned: 5 },
      update: { exitTicketResponse: response, exitTicketSubmitted: true, xpEarned: { increment: 5 } },
    });

    // Per Figma designer note:
    // - Mandatory lessons: exit ticket is AUTOMATICALLY shared with director
    // - Optional lessons: only shared if teacher opts in (shareWithDirector=true)
    const unit = await this.prisma.unit.findUnique({
      where: { id: unitId },
      include: { lesson: { select: { isMandatory: true } } },
    });
    const autoShare = unit?.lesson?.isMandatory === true;
    const shouldShare = autoShare || shareWithDirector;

    if (shouldShare) {
      await this.prisma.reflection.create({
        data: { userId, unitId, content: response, sharedWithDirector: true },
      });
    }

    return progress;
  }

  async submitQuiz(userId: string, unitId: string, answers: { questionId: string; optionId: string }[]) {
    const questions = await this.prisma.quizQuestion.findMany({
      where: { unitId },
      include: { options: true },
    });

    let correctCount = 0;
    let totalXp = 0;

    for (const answer of answers) {
      const question = questions.find(q => q.id === answer.questionId);
      if (!question) continue;
      const selectedOption = question.options.find(o => o.id === answer.optionId);
      if (selectedOption?.isCorrect) {
        correctCount++;
        totalXp += question.xpValue;
      }
    }

    const score = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

    return this.prisma.lessonProgress.upsert({
      where: { userId_unitId: { userId, unitId } },
      create: { userId, unitId, quizScore: score, quizCompleted: true, xpEarned: totalXp, completedAt: new Date() },
      update: { quizScore: score, quizCompleted: true, xpEarned: { increment: totalXp }, completedAt: new Date() },
    });
  }

  async getTotalXp(userId: string) {
    const result = await this.prisma.lessonProgress.aggregate({
      where: { userId },
      _sum: { xpEarned: true },
    });
    return { totalXp: result._sum.xpEarned || 0 };
  }

  /**
   * Weekly Progress / Engagement score per Figma designer note:
   *   40% XP + 40% lessons + 20% logins
   *
   * Each sub-metric is normalized to 0–100:
   *   xpPct      = totalXp / 500 capped at 100    (500 XP = perfect week)
   *   lessonsPct = completed / totalUnits * 100    (from global lessons)
   *   loginsPct  = loginsThisWeek / 7 * 100        (7+ days = perfect)
   */
  async getWeeklyEngagement(userId: string) {
    const [xpAgg, totalUnits, completed, user] = await Promise.all([
      this.prisma.lessonProgress.aggregate({
        where: { userId },
        _sum: { xpEarned: true },
      }),
      this.prisma.unit.count(),
      this.prisma.lessonProgress.count({ where: { userId, quizCompleted: true } }),
      this.prisma.user.findUnique({ where: { id: userId }, select: { lastLoginAt: true } }),
    ]);

    const totalXp = xpAgg._sum.xpEarned || 0;
    const xpPct = Math.min(100, (totalXp / 500) * 100);
    const lessonsPct = totalUnits > 0 ? Math.min(100, (completed / totalUnits) * 100) : 0;

    // Count distinct login days in the last 7 days. We only track `lastLoginAt`
    // in the demo schema, so approximate: if they logged in this week → 100/7
    // per day they've been active. For a demo, use a simpler heuristic: treat
    // a user who's logged in at all today as having loginsPct = 100.
    const loginsPct = user?.lastLoginAt
      ? Date.now() - user.lastLoginAt.getTime() < 24 * 60 * 60 * 1000
        ? 100
        : 50
      : 0;

    const score = Math.round(0.4 * xpPct + 0.4 * lessonsPct + 0.2 * loginsPct);

    return {
      score,
      breakdown: {
        xpPct: Math.round(xpPct),
        lessonsPct: Math.round(lessonsPct),
        loginsPct: Math.round(loginsPct),
      },
    };
  }

  async submitReflection(userId: string, unitId: string, content: string, sharedWithDirector: boolean) {
    return this.prisma.reflection.create({
      data: { userId, unitId, content, sharedWithDirector },
    });
  }
}
