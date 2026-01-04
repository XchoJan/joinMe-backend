import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Event } from './event.entity';
import { User } from './user.entity';

export type RequestStatus = 'pending' | 'approved' | 'rejected';

@Entity('event_requests')
export class EventRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  eventId: string;

  @ManyToOne(() => Event)
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'text',
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  })
  status: RequestStatus;

  @CreateDateColumn()
  createdAt: Date;
}

