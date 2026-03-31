import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('DIRECTOR', 'ADMIN')
export class AnalyticsController {
  constructor(private analytics: AnalyticsService) {}

  @Get('overview')
  getOverview(@Request() req: any) {
    return this.analytics.getDirectorOverview(req.user.sub);
  }

  @Get('reflections')
  getReflections(@Request() req: any) {
    return this.analytics.getReflections(req.user.sub);
  }

  @Get('teachers')
  getTeacherAnalytics(@Request() req: any) {
    return this.analytics.getTeacherAnalytics(req.user.sub);
  }
}
