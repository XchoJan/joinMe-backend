import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  photo?: string;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column()
  city: string;

  @Column({
    type: 'text',
    enum: ['male', 'female'],
    nullable: true,
  })
  gender?: 'male' | 'female';

  @Column({ nullable: true })
  instagram?: string;

  @Column({ nullable: true })
  telegram?: string;

  @Column({ nullable: true })
  fcmToken?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

