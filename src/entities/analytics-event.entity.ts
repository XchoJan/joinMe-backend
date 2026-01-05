import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

export enum AnalyticsEventType {
  USER_CREATED = 'user_created',
  EVENT_CREATED = 'event_created',
  EVENT_REQUEST_CREATED = 'event_request_created',
}

@Entity('analytics_events')
export class AnalyticsEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'text',
    enum: AnalyticsEventType,
  })
  type: AnalyticsEventType;

  @Column({ nullable: true })
  userId?: string;

  @Column({ nullable: true })
  eventId?: string;

  @Column({ type: 'text', nullable: true, default: null })
  metadata?: string | null; // JSON строка для дополнительных данных

  @CreateDateColumn()
  createdAt: Date;
}

