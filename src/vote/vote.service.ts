import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, MoreThan } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Vote, Contestant } from './vote.entity';
import { CreateVoteDto } from './dto/create-vote.dto';
import { UpdateVoteDto } from './dto/update-vote.dto';
import { CastVoteDto } from './dto/cast-vote.dto';
import { MailService } from 'src/mail/mail.service';
import { User } from 'src/users/user.entity';
import { VoteVisit } from './voteVisits.entity';

@Injectable()
export class VoteService {
  constructor(
    @InjectRepository(Vote)
    private readonly votesRepository: Repository<Vote>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(VoteVisit)
    private readonly visitRepository: Repository<VoteVisit>,

    private readonly mailService: MailService,
  ) {}

  // ─── Create Vote ──────────────────────────────────────────────
  async create(dto: CreateVoteDto, userId: number): Promise<Vote> {
    const contestants: Contestant[] = (dto.contestants ?? []).map((c) => ({
      ...c,
      id: uuidv4(),
      totalVote: 0,
    }));

    const vote = this.votesRepository.create({
      ...dto,
      voteStart: new Date(dto.voteStart),
      voteEnd: new Date(dto.voteEnd),
      contestants,
      userId,
      approved: false,
    });

    const savedVote = await this.votesRepository.save(vote);

    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'name', 'email', 'businessName'],
    });

    if (!user) {
      throw new NotFoundException('Organizer not found');
    }

    const approveLink = `${process.env.BACKEND_URL}/vote/approve/${savedVote.id}`;

    await this.mailService.sendVoteApprovalRequestEmail({
      vote: {
        title: savedVote.title,
        edition: savedVote.edition,
        voteStart: savedVote.voteStart,
        voteEnd: savedVote.voteEnd,
      },
      organizer: {
        name: user.name,
        email: user.email,
        businessName: user.businessName,
      },
      approveLink,
    });

    return savedVote;
  }

  // ─── Approve Vote ─────────────────────────────────────────────
  async approveVote(id: string): Promise<{ message: string }> {
    const vote = await this.votesRepository.findOneBy({ id });

    if (!vote) {
      throw new NotFoundException('Vote not found');
    }

    vote.approved = true;
    await this.votesRepository.save(vote);

    return { message: 'Vote approved successfully' };
  }

  // ─── Get All Votes (admin) ────────────────────────────────────
  async findAll(): Promise<Vote[]> {
    return this.votesRepository.find({
      relations: ['user'],
      select: {
        user: { id: true, name: true, email: true, businessName: true },
      },
      order: { createdAt: 'DESC' },
    });
  }

  // ─── Get Approved & Active Votes (public) ────────────────────
  async findApproved(page = 1, limit = 10) {
    const now = new Date();

    const [data, total] = await this.votesRepository.findAndCount({
      where: { approved: true, voteEnd: MoreThan(now) },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ─── Track Visit ──────────────────────────────────────────────
  async trackVisit(voteId: string, ip?: string, userAgent?: string) {
    const vote = await this.votesRepository.findOne({ where: { id: voteId } });

    if (!vote) {
      throw new NotFoundException('Vote not found');
    }

    const exists = await this.visitRepository.findOne({
      where: {voteId: Number(voteId), ipAddress: ip },
    });

    if (exists) return; // prevent duplicate spam

    return this.visitRepository.save(
      this.visitRepository.create({ voteId:Number(voteId), ipAddress: ip, userAgent }),
    );
  }

  // ─── Get Vote By Title (exact, case-insensitive) ──────────────
  async findOne(title: string): Promise<Vote> {
    const vote = await this.votesRepository.findOne({
      where: { title: ILike(title) },
      relations: ['user'],
      select: {
        user: { id: true, name: true, email: true, businessName: true },
      },
    });

    if (!vote) {
      throw new NotFoundException(`Vote "${title}" not found`);
    }

    return vote;
  }

  // ─── Get Vote By ID ───────────────────────────────────────────
  async findOneById(id: string): Promise<Vote> {
    const vote = await this.votesRepository.findOne({
      where: { id },
      relations: ['user'],
      select: {
        user: { id: true, name: true, email: true, businessName: true },
      },
    });

    if (!vote) {
      throw new NotFoundException(`Vote #${id} not found`);
    }

    return vote;
  }

  // ─── Search Votes By Title ────────────────────────────────────
  async findByTitle(title: string): Promise<Vote[]> {
    const votes = await this.votesRepository.find({
      where: { title: ILike(`%${title}%`) },
      relations: ['user'],
      select: {
        user: { id: true, name: true, email: true, businessName: true },
      },
      order: { createdAt: 'DESC' },
    });

    if (!votes.length) {
      throw new NotFoundException(`No votes found matching "${title}"`);
    }

    return votes;
  }

  // ─── Get Votes By User ────────────────────────────────────────
  async findByUser(userId: number): Promise<Vote[]> {
    return this.votesRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  // ─── Get Vote + Contestant By IDs ─────────────────────────────
  async findContestantByVoteAndId(voteId: string, contestantId: string) {
    const vote = await this.votesRepository.findOne({ where: { id: voteId } });

    if (!vote) {
      throw new NotFoundException(`Vote "${voteId}" not found`);
    }

    if (!Array.isArray(vote.contestants)) {
      throw new Error(`Invalid contestants structure for vote ${voteId}`);
    }

    const contestant = vote.contestants.find(
      (c) => String(c.id) === String(contestantId),
    );

    return contestant || null;
  }

  // ─── Get Votes With Visit Counts By Organizer Email ───────────
  async findVotesWithVisitsByEmail(email: string): Promise<Vote[]> {
    const votes = await this.votesRepository
      .createQueryBuilder('vote')
      .leftJoinAndSelect('vote.user', 'user')
      .leftJoin('vote.visits', 'visit')
      .loadRelationCountAndMap('vote.visitsCount', 'vote.visits')
      .where('user.email = :email', { email })
      .orderBy('vote.createdAt', 'DESC')
      .getMany();

    return votes; // empty array is fine — caller decides
  }

  // ─── Cast Vote (increment contestant totalVote) ───────────────
  async castVote(voteId: string, dto: CastVoteDto, ip?: string): Promise<Vote | null> {
    const vote = await this.votesRepository.findOneBy({ id: voteId });

    if (!vote) throw new NotFoundException(`Vote #${voteId} not found`);
    if (!vote.approved) throw new BadRequestException('This vote is not yet active');

    const now = new Date();
    if (now < vote.voteStart) throw new BadRequestException('Voting has not started yet');
    if (now > vote.voteEnd) throw new BadRequestException('Voting has ended');

    if (!Array.isArray(vote.contestants) || vote.contestants.length === 0) {
      throw new BadRequestException('This vote has no contestants');
    }

    // Enforce one-vote-per-device by IP
    if (vote.oneVotePerDevice && ip) {
      const alreadyVoted = await this.visitRepository.findOne({
        where: { voteId: Number(voteId), ipAddress: ip },
      });
      if (alreadyVoted) {
        throw new BadRequestException('You have already voted from this device');
      }
    }

    const contestantIndex = vote.contestants.findIndex(
      (c) => c.id === dto.contestantId,
    );

    if (contestantIndex === -1) {
      throw new NotFoundException(`Contestant "${dto.contestantId}" not found`);
    }

    vote.contestants[contestantIndex] = {
      ...vote.contestants[contestantIndex],
      totalVote: vote.contestants[contestantIndex].totalVote + (dto.voteCount ?? 1),
    };

    await this.votesRepository
      .createQueryBuilder()
      .update(Vote)
      .set({ contestants: vote.contestants })
      .where('id = :id', { id: voteId })
      .execute();

    // Record the visit/vote fingerprint
    if (ip) {
      await this.visitRepository.save(
        this.visitRepository.create({ voteId: Number(voteId), ipAddress: ip }),
      );
    }

    return this.votesRepository.findOneBy({ id: voteId });
  }

  // ─── Update Vote ──────────────────────────────────────────────
  async update(id: string, dto: UpdateVoteDto, userId: number): Promise<Vote> {
    const vote = await this.votesRepository.findOneBy({ id });
    if (!vote) throw new NotFoundException(`Vote #${id} not found`);
    if (vote.userId !== userId) throw new ForbiddenException('You do not own this vote');

    if (dto.contestants !== undefined) {
      if (dto.contestants.length === 0) {
        throw new BadRequestException('Cannot remove all contestants from a vote');
      }

      const updatedContestants: Contestant[] = dto.contestants.map((c) => {
        const existing = vote.contestants?.find((ec) => ec.id === c.id);
        return {
          ...c,
          id: existing ? existing.id : uuidv4(),
          totalVote: existing ? existing.totalVote : 0, // preserve vote counts
        };
      });

      vote.contestants = updatedContestants;
    }

    const { contestants, ...rest } = dto;
    Object.assign(vote, {
      ...rest,
      ...(dto.voteStart && { voteStart: new Date(dto.voteStart) }),
      ...(dto.voteEnd && { voteEnd: new Date(dto.voteEnd) }),
    });

    return this.votesRepository.save(vote);
  }

  // ─── Delete Vote ──────────────────────────────────────────────
  async remove(id: string, userId: number): Promise<{ message: string }> {
    const vote = await this.votesRepository.findOneBy({ id });
    if (!vote) throw new NotFoundException(`Vote #${id} not found`);
    if (vote.userId !== userId) throw new ForbiddenException('You do not own this vote');

    await this.votesRepository.remove(vote);
    return { message: `Vote #${id} deleted successfully` };
  }

  // ─── Dashboard Overview ───────────────────────────────────────
  async getDashboardOverview(userId: number) {
    const votes = await this.votesRepository.find({
      where: { userId },
    });

    const now = new Date();

    const totalVotes = votes.length;

    const totalVotesCast = votes.reduce(
      (acc, v) =>
        acc + (v.contestants ?? []).reduce((sum, c) => sum + c.totalVote, 0),
      0,
    );

    const totalRevenue = votes
      .filter((v) => v.pricing === 'paid')
      .reduce(
        (acc, v) =>
          acc +
          (v.contestants ?? []).reduce(
            (sum, c) => sum + c.totalVote * Number(v.pricePerVote),
            0,
          ),
        0,
      );

    const upcomingVotes = votes
      .filter((v) => new Date(v.voteEnd) > now)
      .sort((a, b) => new Date(a.voteStart).getTime() - new Date(b.voteStart).getTime())
      .slice(0, 5)
      .map((v) => ({
        id: v.id,
        title: v.title,
        edition: v.edition,
        voteStart: v.voteStart,
        voteEnd: v.voteEnd,
        totalVotesCast: (v.contestants ?? []).reduce((sum, c) => sum + c.totalVote, 0),
      }));

    return {
      stats: {
        totalVotes,
        totalVotesCast,
        totalRevenue,
      },
      upcomingVotes,
    };
  }
}