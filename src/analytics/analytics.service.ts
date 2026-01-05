import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalyticsEvent, AnalyticsEventType } from '../entities/analytics-event.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(AnalyticsEvent)
    private analyticsRepository: Repository<AnalyticsEvent>,
  ) {}

  async logEvent(
    type: AnalyticsEventType,
    userId?: string,
    eventId?: string,
    metadata?: any,
  ): Promise<void> {
    try {
      const analyticsEvent = this.analyticsRepository.create({
        type,
        userId: userId || undefined,
        eventId: eventId || undefined,
        metadata: metadata ? JSON.stringify(metadata) : undefined,
      });
      await this.analyticsRepository.save(analyticsEvent);
    } catch (error) {
      // Не прерываем выполнение при ошибке логирования
      console.error('Error logging analytics event:', error);
    }
  }

  async getUserCreatedCount(startDate?: Date, endDate?: Date): Promise<number> {
    const query = this.analyticsRepository
      .createQueryBuilder('event')
      .where('event.type = :type', { type: AnalyticsEventType.USER_CREATED });

    if (startDate) {
      query.andWhere('event.createdAt >= :startDate', { startDate });
    }
    if (endDate) {
      query.andWhere('event.createdAt <= :endDate', { endDate });
    }

    return await query.getCount();
  }

  async getEventCreatedCount(startDate?: Date, endDate?: Date): Promise<number> {
    const query = this.analyticsRepository
      .createQueryBuilder('event')
      .where('event.type = :type', { type: AnalyticsEventType.EVENT_CREATED });

    if (startDate) {
      query.andWhere('event.createdAt >= :startDate', { startDate });
    }
    if (endDate) {
      query.andWhere('event.createdAt <= :endDate', { endDate });
    }

    return await query.getCount();
  }

  async getEventRequestCount(startDate?: Date, endDate?: Date): Promise<number> {
    const query = this.analyticsRepository
      .createQueryBuilder('event')
      .where('event.type = :type', { type: AnalyticsEventType.EVENT_REQUEST_CREATED });

    if (startDate) {
      query.andWhere('event.createdAt >= :startDate', { startDate });
    }
    if (endDate) {
      query.andWhere('event.createdAt <= :endDate', { endDate });
    }

    return await query.getCount();
  }

  async getStatistics(startDate?: Date, endDate?: Date) {
    const [userCreated, eventCreated, eventRequests] = await Promise.all([
      this.getUserCreatedCount(startDate, endDate),
      this.getEventCreatedCount(startDate, endDate),
      this.getEventRequestCount(startDate, endDate),
    ]);

    // Статистика по дням за последние 30 дней
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Для SQLite используем strftime вместо DATE
    const dailyStats = await this.analyticsRepository
      .createQueryBuilder('event')
      .select("strftime('%Y-%m-%d', event.createdAt)", 'date')
      .addSelect('event.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('event.createdAt >= :startDate', { startDate: thirtyDaysAgo })
      .groupBy("strftime('%Y-%m-%d', event.createdAt)")
      .addGroupBy('event.type')
      .orderBy('date', 'ASC')
      .getRawMany();

    // Группируем по дням и типам
    const dailyStatsMap: Record<string, Record<string, number>> = {};
    dailyStats.forEach((stat) => {
      const date = stat.date;
      const type = stat.type;
      const count = parseInt(stat.count, 10);

      if (!dailyStatsMap[date]) {
        dailyStatsMap[date] = {};
      }
      dailyStatsMap[date][type] = count;
    });

    // Преобразуем в массив для удобства
    const dailyStatsArray = Object.entries(dailyStatsMap).map(([date, types]) => ({
      date,
      userCreated: types[AnalyticsEventType.USER_CREATED] || 0,
      eventCreated: types[AnalyticsEventType.EVENT_CREATED] || 0,
      eventRequests: types[AnalyticsEventType.EVENT_REQUEST_CREATED] || 0,
    }));

    return {
      total: {
        userCreated,
        eventCreated,
        eventRequests,
      },
      daily: dailyStatsArray,
    };
  }
}

