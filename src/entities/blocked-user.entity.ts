import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('blocked_users')
@Index(['blockerId', 'blockedUserId'], { unique: true })
export class BlockedUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  blockerId: string; // ID пользователя, который заблокировал

  @Column()
  blockedUserId: string; // ID заблокированного пользователя

  @CreateDateColumn()
  createdAt: Date;
}

