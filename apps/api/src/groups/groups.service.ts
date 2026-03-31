import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  async findAll(directorId?: string) {
    return this.prisma.group.findMany({
      where: directorId ? { directorId } : undefined,
      include: {
        members: { include: { user: { select: { id: true, email: true, name: true, role: true } } } },
        director: { select: { id: true, name: true, email: true } },
        _count: { select: { members: true } },
      },
    });
  }

  async findOne(id: string) {
    const group = await this.prisma.group.findUnique({
      where: { id },
      include: {
        members: { include: { user: { select: { id: true, email: true, name: true, role: true } } } },
        director: { select: { id: true, name: true, email: true } },
      },
    });
    if (!group) throw new NotFoundException('Group not found');
    return group;
  }

  async create(directorId: string, data: { name: string; description?: string }) {
    return this.prisma.group.create({
      data: { ...data, directorId },
      include: { director: { select: { id: true, name: true } } },
    });
  }

  async addMember(groupId: string, userId: string) {
    return this.prisma.groupMember.create({
      data: { groupId, userId },
      include: { user: { select: { id: true, email: true, name: true } } },
    });
  }

  async removeMember(groupId: string, userId: string) {
    return this.prisma.groupMember.delete({
      where: { groupId_userId: { groupId, userId } },
    });
  }

  async assignLesson(data: { lessonId: string; groupId?: string; userId?: string; assignedById: string; dueDate?: string }) {
    return this.prisma.lessonAssignment.create({
      data: {
        lessonId: data.lessonId,
        groupId: data.groupId,
        userId: data.userId,
        assignedById: data.assignedById,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      },
      include: { lesson: true, group: true },
    });
  }

  async getAssignments(directorId: string) {
    return this.prisma.lessonAssignment.findMany({
      where: { assignedById: directorId },
      include: {
        lesson: true,
        group: { include: { _count: { select: { members: true } } } },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
