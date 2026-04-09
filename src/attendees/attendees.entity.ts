import { Event } from '../events/event.entity'; // 👈 relative import
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class Attendees {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  email: string;

  @Column({ type: 'varchar' })
  paystackId: string;

  @Column({ type: 'boolean', default: false }) // 👈 explicit type + default
  checkedIn: boolean;

  @Column({ type: 'varchar', nullable: true, default: null })
  qrCode: string | null;

  @Column({ type: 'numeric', precision: 10, scale: 2 }) // 👈 proper money type
  amount: number;

  @Column({ type: 'varchar' })
  ticketType: string;

  @Column({ type: 'varchar' })
  phone: string;

  @ManyToOne(() => Event, (event) => event.attendees, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @Column()
  eventId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}