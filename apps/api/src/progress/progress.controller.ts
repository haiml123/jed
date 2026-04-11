import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('progress')
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(private progress: ProgressService) {}

  @Get()
  getProgress(@Request() req: any) {
    return this.progress.getProgress(req.user.sub);
  }

  @Get('xp')
  getTotalXp(@Request() req: any) {
    return this.progress.getTotalXp(req.user.sub);
  }

  @Get('weekly-engagement')
  getWeeklyEngagement(@Request() req: any) {
    return this.progress.getWeeklyEngagement(req.user.sub);
  }

  @Post('video')
  updateVideo(@Request() req: any, @Body() body: { unitId: string; watchPercent: number }) {
    return this.progress.updateVideoProgress(req.user.sub, body.unitId, body.watchPercent);
  }

  @Post('exit-ticket')
  submitExitTicket(@Request() req: any, @Body() body: { unitId: string; response: string; shareWithDirector?: boolean }) {
    return this.progress.submitExitTicket(req.user.sub, body.unitId, body.response, body.shareWithDirector || false);
  }

  @Post('quiz')
  submitQuiz(@Request() req: any, @Body() body: { unitId: string; answers: { questionId: string; optionId: string }[] }) {
    return this.progress.submitQuiz(req.user.sub, body.unitId, body.answers);
  }

  @Post('reflection')
  submitReflection(@Request() req: any, @Body() body: { unitId: string; content: string; sharedWithDirector?: boolean }) {
    return this.progress.submitReflection(req.user.sub, body.unitId, body.content, body.sharedWithDirector || false);
  }
}
