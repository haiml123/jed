import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

const USER_PUBLIC = {
  id: true,
  email: true,
  name: true,
  role: true,
  avatarUrl: true,
  school: true,
  lastLoginAt: true,
  createdAt: true,
} as const;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({ select: USER_PUBLIC });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: USER_PUBLIC,
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByRole(role: string) {
    return this.prisma.user.findMany({
      where: { role: role as any },
      select: USER_PUBLIC,
    });
  }

  async create(data: {
    name: string;
    email: string;
    password?: string;
    school?: string;
    role?: 'TEACHER' | 'DIRECTOR' | 'ADMIN';
  }) {
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new BadRequestException('Email already registered');
    const password = data.password || 'password123';
    const hashed = await bcrypt.hash(password, 10);
    return this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashed,
        school: data.school,
        role: data.role || 'TEACHER',
      },
      select: USER_PUBLIC,
    });
  }

  async update(
    id: string,
    data: { name?: string; email?: string; school?: string; role?: 'TEACHER' | 'DIRECTOR' | 'ADMIN'; avatarUrl?: string },
  ) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: USER_PUBLIC,
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
