import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { EventRequest } from './event-request.entity';
import { Chat } from './chat.entity';

export type EventFormat = 'coffee' | 'walk' | 'lunch' | 'dinner' | 'activity' | 'other';
export type PaymentType = 'dutch' | 'my_treat' | 'your_treat' | 'free';
export type EventStatus = 'active' | 'completed' | 'cancelled';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  city: string;

  @Column()
  location: string;

  @Column({ type: 'date' })
  date: string;

  @Column()
  time: string;

  @Column({
    type: 'text',
    enum: ['coffee', 'walk', 'lunch', 'dinner', 'activity', 'other'],
  })
  format: EventFormat;

  @Column({
    type: 'text',
    enum: ['dutch', 'my_treat', 'your_treat', 'free'],
  })
  paymentType: PaymentType;

  @Column()
  participantLimit: number;

  @Column({ default: 1 })
  currentParticipants: number; // Сколько человек уже есть

  @Column()
  authorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column({
    type: 'text',
    enum: ['male', 'female'],
    nullable: true,
  })
  authorGender?: 'male' | 'female';

  @Column({
    type: 'text',
    enum: ['active', 'completed', 'cancelled'],
    default: 'active',
  })
  status: EventStatus;

  @Column('simple-array', { default: '' })
  participants: string[];

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => EventRequest, (request) => request.event)
  requests: EventRequest[];

  @OneToMany(() => Chat, (chat) => chat.event)
  chats: Chat[];
}

