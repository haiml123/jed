import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';

@Controller('lessons')
@UseGuards(JwtAuthGuard)
export class LessonsController {
  constructor(private lessons: LessonsService) {}

  @Get()
  findAll() {
    return this.lessons.findAll();
  }

  @Get('assigned')
  getAssigned(@Request() req: any) {
    return this.lessons.getAssignedLessons(req.user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lessons.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'DIRECTOR')
  create(@Body() body: any) {
    return this.lessons.create(body);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'DIRECTOR')
  update(@Param('id') id: string, @Body() body: any) {
    return this.lessons.update(id, body);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  delete(@Param('id') id: string) {
    return this.lessons.delete(id);
  }

  @Post('units')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'DIRECTOR')
  createUnit(@Body() body: any) {
    return this.lessons.createUnit(body);
  }

  @Post('quiz-questions')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'DIRECTOR')
  createQuizQuestion(@Body() body: any) {
    return this.lessons.createQuizQuestion(body);
  }
}
