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
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { UpdateTicketQtyDto } from './dto/update-ticket-qty.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  // POST /events — protected
  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateEventDto, @Request() req) {
    return this.eventsService.create(dto, req.user.id);
  }
  
@UseGuards(JwtAuthGuard)
@Get('dashboard-overview') 
getDashboardOverview(@Req() req: any) {
  return this.eventsService.getDashboardOverview(req.user.id);
}
  
  @UseGuards(JwtAuthGuard)
  @Get('/events-by-user') 
  eventByAttendees(
     @Req() req: {user: {email: string }},

  ) {
    return this.eventsService.findEventsWithAttendeesByEmail(req.user.email);
  }

  @Get('approved')
async getApprovedEvents(
  @Query('page') page?: string,
  @Query('limit') limit?: string,
) {
  return this.eventsService.findApproved(
    page ? parseInt(page) : 1,
    limit ? parseInt(limit) : 10,
  );
}

  @Get('approve/:id')
async approve(@Param('id') id: number) {
  return this.eventsService.approveEvent(Number(id));
}

@Post(':id/visit')
async trackEventVisit(
  @Param('id') id: number,
  @Req() req: any,
) {
  return this.eventsService.trackVisit(
    Number(id),
    req.ip,
    req.headers['user-agent'],
  );
}

  // GET /events — public
  @Get()
  findAll() {
    return this.eventsService.findAll(); 
  }

  // GET /events/search?title=concert — public
  @Get('search')
  findByTitle(@Query('title') title: string) {
    return this.eventsService.findByTitle(title);
  }

  // GET /events/my-events — protected
  @UseGuards(JwtAuthGuard)
  @Get('my-events')
  findMyEvents(@Request() req) {
    return this.eventsService.findByUser(req.user.id);
  }

  // GET /events/:id — public
  @Get(':name')
  findOne(@Param('name') name: string) {
    return this.eventsService.findOne(name);
  }

  // PATCH /events/:id — protected
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEventDto,
    @Request() req,
  ) {
    return this.eventsService.update(id, dto, req.user.id);
  }

  // PATCH /events/:id/tickets/qty — protected
  @UseGuards(JwtAuthGuard)
  @Patch(':id/tickets/qty')
  updateTicketQty(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTicketQtyDto,
  ) {
    return this.eventsService.updateTicketQty(id, dto);
  }

  // DELETE /events/:id — protected
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.eventsService.remove(id, req.user.id);
  }


}