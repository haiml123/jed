import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDirectorOverview(directorId: string) {
    const groups = await this.prisma.group.findMany({
      where: { directorId },
      include: { members: true },
    });
    const teacherIds = groups.flatMap(g => g.members.map(m => m.userId));
    const uniqueTeacherIds = [...new Set(teacherIds)];

    const totalTeachers = uniqueTeacherIds.length;
    const totalLessons = await this.prisma.lesson.count();

    const completedProgress = await this.prisma.lessonProgress.count({
      where: { userId: { in: uniqueTeacherIds }, quizCompleted: true },
    });

    const totalProgress = await this.prisma.lessonProgress.count({
      where: { userId: { in: uniqueTeacherIds } },
    });

    const xpData = await this.prisma.lessonProgress.aggregate({
      where: { userId: { in: uniqueTeacherIds } },
      _sum: { xpEarned: true },
      _avg: { quizScore: true },
    });

    const reflections = await this.prisma.reflection.count({
      where: { userId: { in: uniqueTeacherIds }, sharedWithDirector: true },
    });

    return {
      totalTeachers,
      totalLessons,
      completedLessons: completedProgress,
      totalXpEarned: xpData._sum.xpEarned || 0,
      averageQuizScore: Math.round(xpData._avg.quizScore || 0),
      sharedReflections: reflections,
      completionRate: totalProgress > 0 ? Math.round((completedProgress / totalProgress) * 100) : 0,
    };
  }

  async getReflections(directorId: string) {
    const groups = await this.prisma.group.findMany({
      where: { directorId },
      include: { members: true },
    });
    const teacherIds = [...new Set(groups.flatMap(g => g.members.map(m => m.userId)))];

    return this.prisma.reflection.findMany({
      where: { userId: { in: teacherIds }, sharedWithDirector: true },
      include: {
        user: { select: { id: true, name: true, email: true } },
        unit: { include: { lesson: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTeacherAnalytics(directorId: string) {
    const groups = await this.prisma.group.findMany({
      where: { directorId },
      include: { members: { include: { user: { select: { id: true, name: true, email: true } } } } },
    });
    const memberMap = new Map<string, { id: string; name: string; email: string }>();
    for (const g of groups) {
      for (const m of g.members) {
        if (!memberMap.has(m.userId)) {
          memberMap.set(m.userId, m.user);
        }
      }
    }
    const teachers = [...memberMap.values()];

    const analytics = await Promise.all(
      teachers.map(async (teacher) => {
        const progress = await this.prisma.lessonProgress.findMany({ where: { userId: teacher.id } });
        const totalXp = progress.reduce((sum, p) => sum + p.xpEarned, 0);
        const completed = progress.filter(p => p.quizCompleted).length;
        const avgScore = progress.filter(p => p.quizScore !== null).reduce((sum, p, _, arr) => sum + (p.quizScore || 0) / arr.length, 0);
        return { id: teacher.id, name: teacher.name, email: teacher.email, totalXp, completedLessons: completed, averageQuizScore: Math.round(avgScore), totalUnits: progress.length };
      })
    );

    return analytics;
  }
}
