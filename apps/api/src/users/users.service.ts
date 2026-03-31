import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, avatarUrl: true, createdAt: true },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, role: true, avatarUrl: true, createdAt: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByRole(role: string) {
    return this.prisma.user.findMany({
      where: { role: role as any },
      select: { id: true, email: true, name: true, role: true, avatarUrl: true, createdAt: true },
    });
  }

  async update(id: string, data: { name?: string; avatarUrl?: string }) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, name: true, role: true, avatarUrl: true },
    });
  }

  async delete(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }

  async getTeacherProgress(teacherId: string) {
    const progress = await this.prisma.lessonProgress.findMany({
      where: { userId: teacherId },
      include: { unit: { include: { lesson: true } } },
    });
    const xp = await this.prisma.lessonProgress.aggregate({
      where: { userId: teacherId },
      _sum: { xpEarned: true },
    });
    return { progress, totalXp: xp._sum.xpEarned || 0 };
  }
}
