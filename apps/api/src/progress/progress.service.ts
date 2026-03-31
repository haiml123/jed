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

    if (shareWithDirector) {
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

  async submitReflection(userId: string, unitId: string, content: string, sharedWithDirector: boolean) {
    return this.prisma.reflection.create({
      data: { userId, unitId, content, sharedWithDirector },
    });
  }
}
