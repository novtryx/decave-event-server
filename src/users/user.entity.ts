import { Event } from '../events/event.entity';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

export class Socials {
  @Column({ nullable: true })
  tiktok: string;

  @Column({ nullable: true })
  instagram: string;

  @Column({ nullable: true })
  twitter: string;

  @Column({ nullable: true })
  facebook: string;
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  businessName: string;

  @Column({type: 'varchar', nullable: true, default: null})
  profileImage: string | null

  @Column()
  password: string;

  
   @Column({ type: 'varchar', nullable: true })
resetToken: string | null;

@Column({ type: 'timestamp', nullable: true })
resetTokenExpiry: Date | null;

  @Column()
  address: string;
 
  @Column({ type: 'timestamp', nullable: true, default: null })
  emailVerified: Date | null;  // 👈 nullable

  @Column(() => Socials)
  socials: Socials;  // 👈 stored as flat columns: socials_tiktok, socials_instagram, etc.

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'varchar', nullable: true })
  verifyToken: string | null;

  @OneToMany(() => Event, (event) => event.user)
  events: Event[]; // 👈 add this
}