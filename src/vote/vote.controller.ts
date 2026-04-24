import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { VoteService } from './vote.service';
import { CreateVoteDto } from './dto/create-vote.dto';
import { UpdateVoteDto } from './dto/update-vote.dto';
import { CastVoteDto } from './dto/cast-vote.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('vote')
export class VoteController {
  constructor(private readonly votesService: VoteService) {}

  // POST /votes — protected
  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateVoteDto, @Request() req) {
    return this.votesService.create(dto, req.user.id);
  }

  // GET /votes/dashboard-overview — protected
  @UseGuards(JwtAuthGuard)
  @Get('dashboard-overview')
  getDashboardOverview(@Req() req: any) {
    return this.votesService.getDashboardOverview(req.user.id);
  }

  // GET /votes/votes-by-user — protected
  @UseGuards(JwtAuthGuard)
  @Get('votes-by-user')
  votesByUser(@Req() req: { user: { email: string } }) {
    return this.votesService.findVotesWithVisitsByEmail(req.user.email);
  }

  // GET /votes/approved?page=&limit= — public
  @Get('approved')
  async getApprovedVotes(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.votesService.findApproved(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
    );
  }

  // GET /votes/approve/:id — public (hit via email link)
  @Get('approve/:id')
  async approve(@Param('id') id: string) {
    return this.votesService.approveVote(id);
  }

  // POST /votes/:id/visit — public
  @Post(':id/visit')
  async trackVoteVisit(@Param('id') id: string, @Req() req: any) {
    return this.votesService.trackVisit(id, req.ip, req.headers['user-agent']);
  }

  // POST /votes/:id/cast — public
  @Post(':id/cast')
  @HttpCode(HttpStatus.OK)
  async castVote(
    @Param('id') id: string,
    @Body() dto: CastVoteDto,
    @Req() req: any,
  ) {
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.ip;
    return this.votesService.castVote(id, dto, ip);
  }

  // GET /votes — public
  @Get()
  findAll() {
    return this.votesService.findAll();
  }

  // GET /votes/search?title= — public
  @Get('search')
  findByTitle(@Query('title') title: string) {
    return this.votesService.findByTitle(title);
  }

  // GET /votes/my-votes — protected
  @UseGuards(JwtAuthGuard)
  @Get('my-votes')
  findMyVotes(@Request() req) {
    return this.votesService.findByUser(req.user.id); 
  }

  // GET /votes/:id — public
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.votesService.findOneById(id);
  }

  // GET /votes/:voteId/contestants/:contestantId — public
  @Get(':voteId/contestants/:contestantId')
  findContestant(
    @Param('voteId') voteId: string,
    @Param('contestantId') contestantId: string,
  ) {
    return this.votesService.findContestantByVoteAndId(voteId, contestantId);
  }

  // PATCH /votes/:id — protected
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateVoteDto,
    @Request() req,
  ) {
    return this.votesService.update(id, dto, req.user.id);
  }

  // DELETE /votes/:id — protected
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.votesService.remove(id, req.user.id);
  }
}