import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bullmq';
import { OverdueTasksService } from './overdue-tasks.service';
import { TasksModule } from '../../modules/tasks/tasks.module';

@Module({
  imports: [
    TasksModule,
    ScheduleModule.forRoot(),
    BullModule.registerQueue({
      name: 'task-processing',
    }),
  ],
  providers: [OverdueTasksService],
  exports: [OverdueTasksService],
})
export class ScheduledTasksModule {}
