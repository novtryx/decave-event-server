import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { Vote } from './vote.entity';

@Entity()
export class VoteVisit {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Vote, (vote) => vote.visits, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'voteId' })
  vote: Vote;

  @Column()
  voteId: number;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @CreateDateColumn()
  createdAt: Date;
}
