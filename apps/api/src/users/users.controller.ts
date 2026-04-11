import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private users: UsersService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'DIRECTOR')
  findAll(@Query('role') role?: string) {
    if (role) return this.users.findByRole(role);
    return this.users.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.users.findOne(id);
  }

  @Get(':id/progress')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'DIRECTOR')
  getTeacherProgress(@Param('id') id: string) {
    return this.users.getTeacherProgress(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  create(@Body() body: { name: string; email: string; password?: string; school?: string; role?: 'TEACHER' | 'DIRECTOR' | 'ADMIN' }) {
    return this.users.create(body);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body()
    body: { name?: string; email?: string; school?: string; role?: 'TEACHER' | 'DIRECTOR' | 'ADMIN'; avatarUrl?: string },
  ) {
    return this.users.update(id, body);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  delete(@Param('id') id: string) {
    return this.users.delete(id);
  }
}
