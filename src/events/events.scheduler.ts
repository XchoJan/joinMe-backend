import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventsService } from './events.service';

@Injectable()
export class EventsScheduler implements OnModuleInit {
  constructor(private readonly eventsService: EventsService) {}

  // Запускается при старте приложения для удаления прошедших событий
  async onModuleInit() {
    try {
      const deletedCount = await this.eventsService.deleteExpiredEvents();
      if (deletedCount > 0) {
        console.log(`[EventsScheduler] On startup: Deleted ${deletedCount} expired event(s)`);
      }
    } catch (error) {
      console.error('[EventsScheduler] Error deleting expired events on startup:', error);
    }
  }

  // Запускается каждый час для удаления прошедших событий
  @Cron(CronExpression.EVERY_HOUR)
  async handleExpiredEvents() {
    try {
      const deletedCount = await this.eventsService.deleteExpiredEvents();
      if (deletedCount > 0) {
        console.log(`[EventsScheduler] Hourly cleanup: Deleted ${deletedCount} expired event(s)`);
      }
    } catch (error) {
      console.error('[EventsScheduler] Error deleting expired events:', error);
    }
  }
}

