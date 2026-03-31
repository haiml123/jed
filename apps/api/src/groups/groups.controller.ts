import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';

@Controller('groups')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('DIRECTOR', 'ADMIN')
export class GroupsController {
  constructor(private groups: GroupsService) {}

  @Get()
  findAll(@Request() req: any) {
    return this.groups.findAll(req.user.role === 'DIRECTOR' ? req.user.sub : undefined);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groups.findOne(id);
  }

  @Post()
  create(@Request() req: any, @Body() body: { name: string; description?: string }) {
    return this.groups.create(req.user.sub, body);
  }

  @Post(':id/members')
  addMember(@Param('id') id: string, @Body() body: { userId: string }) {
    return this.groups.addMember(id, body.userId);
  }

  @Delete(':id/members/:userId')
  removeMember(@Param('id') id: string, @Param('userId') userId: string) {
    return this.groups.removeMember(id, userId);
  }

  @Post('assign')
  assignLesson(@Request() req: any, @Body() body: { lessonId: string; groupId?: string; userId?: string; dueDate?: string }) {
    return this.groups.assignLesson({ ...body, assignedById: req.user.sub });
  }

  @Get('assignments/list')
  getAssignments(@Request() req: any) {
    return this.groups.getAssignments(req.user.sub);
  }
}
