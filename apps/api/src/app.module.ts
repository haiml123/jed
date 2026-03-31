import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { LessonsModule } from './lessons/lessons.module';
import { ProgressModule } from './progress/progress.module';
import { UsersModule } from './users/users.module';
import { GroupsModule } from './groups/groups.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [PrismaModule, AuthModule, LessonsModule, ProgressModule, UsersModule, GroupsModule, AnalyticsModule],
})
export class AppModule {}
