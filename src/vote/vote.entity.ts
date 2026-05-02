import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
    Index,
} from 'typeorm';
import { User } from '../users/user.entity';
import { VoteVisit } from './voteVisits.entity';

export class Contestant {
    id: string;
    name: string;
    tagline: string;
    category: string;
    photoUrl: string;
    totalVote: number;
}
export enum PricingType {
    FREE = "free",
    PAID = "paid",
}

@Index(['title', 'userId', 'id'])
@Entity()
export class Vote {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar' })
    title: string;

    @Column({ type: 'varchar' })
    description: string;

    @Column({ type: 'varchar' })
    edition: string;

    @Column({ type: 'datetime' })
    voteStart: Date;

    @Column({ type: 'datetime' })
    voteEnd: Date;

    @Column({
        type: "enum",
        enum: PricingType,
        default: PricingType.FREE,
    })
    pricing: PricingType;


    @Column() 
    pricePerVote: number;


    @Column({ type: 'boolean', nullable: true, default: false })
    showLiveCount: boolean | null;

    @Column({ type: 'boolean', nullable: true, default: false })
    publicLeaderboard: boolean | null;

    @Column({ type: 'boolean', default: false })
    oneVotePerDevice: boolean;

    @Column({ type: 'varchar', nullable: true })
    banner: string | null;

    @Column({ type: 'json', nullable: true })
    contestants: Contestant[];

    @Column({ type: 'boolean', default: false })
    organizerPays: boolean;

    // ─── Relation ─────────────────────────────────────────────────
    @ManyToOne(() => User, (user) => user.events, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    userId: number;

    @OneToMany(() => VoteVisit, (visit) => visit.vote)
    visits: VoteVisit[];

    @Column({type: "boolean", default: false})
    approved: boolean;

    @CreateDateColumn()
    createdAt: Date;


    @UpdateDateColumn()
    updatedAt: Date;

}