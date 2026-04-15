import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Attendees } from 'src/attendees/attendees.entity';

// ─── Ticket Type (plain class, no decorators) ─────────────────
export class Ticket {
  id: string;
  type: string;
  description: string;
  price: number;
  startQty: number;
  qtySold: number;
  startDate: Date;
  stopdate: Date;
}

@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'varchar' })
  type: string;

  @Column({ type: 'varchar' })
  description: string;

  @Column({ type: 'varchar' })
  venue: string;

  @Column({type: 'boolean', default: false})
  visibilty: boolean;

  @Column({ type: 'varchar' })
  address: string;

  @Column({ type: 'timestamp' })
  eventDate: Date;

  @Column({ type: 'varchar', nullable: true, default: null })
  theme: string | null;

  @Column({ type: 'varchar', nullable: true, default: null })
  banner: string | null;

   @Column({ type: 'jsonb', nullable: true, default: null })
  otherImages: string[] | null;

  // ─── Tickets stored as array of objects in jsonb ──────────────
  @Column({ type: 'jsonb', default: [] })
  tickets: Ticket[];

  @Column({type: 'boolean', default: false})
  organizerPays: boolean;

  // ─── Relation ─────────────────────────────────────────────────
  @ManyToOne(() => User, (user) => user.events, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @OneToMany(() => Attendees, (attendee) => attendee.event)
  attendees: Attendees[]; // 👈 add this

  @CreateDateColumn()
  createdAt: Date;


  @UpdateDateColumn()
  updatedAt: Date;

   attendeesCount?: number;
}