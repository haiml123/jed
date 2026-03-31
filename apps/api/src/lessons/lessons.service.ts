import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LessonsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.lesson.findMany({
      include: {
        units: {
          include: { keyTakeaways: { orderBy: { order: 'asc' } } },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: {
        units: {
          include: {
            keyTakeaways: { orderBy: { order: 'asc' } },
            quizQuestions: {
              include: { options: true },
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');
    return lesson;
  }

  async create(data: { title: string; description?: string; videoUrl?: string; videoDuration?: number; thumbnailUrl?: string; isMandatory?: boolean; order?: number }) {
    return this.prisma.lesson.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.lesson.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.lesson.delete({ where: { id } });
  }

  async createUnit(data: { title: string; description?: string; order?: number; lessonId: string; keyTakeaways?: { text: string; order: number }[] }) {
    const { keyTakeaways, ...unitData } = data;
    return this.prisma.unit.create({
      data: {
        ...unitData,
        keyTakeaways: keyTakeaways ? { create: keyTakeaways } : undefined,
      },
      include: { keyTakeaways: true },
    });
  }

  async createQuizQuestion(data: { text: string; order?: number; unitId: string; xpValue?: number; options: { text: string; isCorrect: boolean }[] }) {
    const { options, ...questionData } = data;
    return this.prisma.quizQuestion.create({
      data: {
        ...questionData,
        options: { create: options },
      },
      include: { options: true },
    });
  }

  async getAssignedLessons(userId: string) {
    const assignments = await this.prisma.lessonAssignment.findMany({
      where: {
        OR: [
          { userId },
          { group: { members: { some: { userId } } } },
        ],
      },
      include: {
        lesson: {
          include: {
            units: {
              include: { keyTakeaways: { orderBy: { order: 'asc' } } },
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });
    return assignments.map(a => ({ ...a.lesson, assignment: { id: a.id, dueDate: a.dueDate } }));
  }
}
