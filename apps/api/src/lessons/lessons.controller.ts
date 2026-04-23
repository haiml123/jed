import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { z } from 'zod';
import { LessonsService } from './lessons.service';
import { AiService } from '../ai/ai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';

// Inline copy of packages/shared/src/schemas/ai.ts GenerateQuizInputSchema.
// Kept here because the @jed/shared path alias is not resolved at runtime
// in the Vercel serverless bundle.
const GenerateQuizInputSchema = z.object({
  lessonTitle: z.string().min(1).max(200),
  topic: z.string().min(1).max(200),
  description: z.string().max(3000).optional().default(''),
  numQuestions: z.number().int().min(1).max(10).default(5),
});

@Controller('lessons')
@UseGuards(JwtAuthGuard)
export class LessonsController {
  constructor(
    private lessons: LessonsService,
    private ai: AiService,
  ) {}

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

  /**
   * Generate quiz questions for a lesson using OpenAI.
   * Admin/Director only. Rate limited to 20 calls/hour/user.
   * Does NOT write to the database — the frontend decides whether
   * to keep, edit, or discard the suggestions.
   */
  @Post('quiz/generate')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'DIRECTOR')
  async generateQuiz(@Request() req: any, @Body() body: unknown) {
    const parsed = GenerateQuizInputSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.issues);
    }
    return this.ai.generateQuiz(req.user.sub, parsed.data);
  }
}
