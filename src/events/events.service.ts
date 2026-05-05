import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, MoreThan } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Event, Ticket } from './event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { UpdateTicketQtyDto } from './dto/update-ticket-qty.dto';
import { MailService } from 'src/mail/mail.service';
import { User } from 'src/users/user.entity';
import { EventVisit } from './eventVisit.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(EventVisit)
    private readonly visitRepository: Repository<EventVisit>,
    private readonly mailService: MailService,
  ) {}

  // ─── Create Event ─────────────────────────────────────────────
  async create(dto: CreateEventDto, userId: number): Promise<Event> {
    const tickets: Ticket[] = dto.tickets.map((ticket) => ({
      ...ticket,
      id: uuidv4(),
      qtySold: 0,
      startDate: new Date(ticket.startDate),
      stopdate: new Date(ticket.stopdate),
    }));

    const event = this.eventsRepository.create({
      ...dto,
      eventDate: new Date(dto.eventDate),
      tickets,
      userId,
      approved: false,
    });

    // ✅ FIX 1: await once, use directly — no more multiple awaits
    const savedEvent = await this.eventsRepository.save(event);

    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'name', 'email', 'businessName'],
    });

    if (!user) {
      throw new NotFoundException('Organizer not found');
    }

    const approveLink = `${process.env.BACKEND_URL}/events/approve/${savedEvent.id}`;

    await this.mailService.sendEventApprovalRequestEmail({
      event: {
        title: savedEvent.title,
        type: savedEvent.type,
        eventDate: savedEvent.eventDate,
        venue: savedEvent.venue,
        address: savedEvent.address,
      },
      organizer: {
        name: user.name,
        email: user.email,
        businessName: user.businessName,
      },
      approveLink,
    });

    return savedEvent;
  }

  // ─── Approve Event ────────────────────────────────────────────
  async approveEvent(id: number) {
    const event = await this.eventsRepository.findOneBy({ id });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    event.approved = true;
    await this.eventsRepository.save(event);

    return { message: 'Event approved successfully' };
  }

  // ─── Get All Events ───────────────────────────────────────────
  async findAll(): Promise<Event[]> {
    return this.eventsRepository.find({
      relations: ['user'],
      select: {
        user: { id: true, name: true, email: true, businessName: true },
      },
      order: { createdAt: 'DESC' },
    });
  }

  // ─── Get Approved Events ──────────────────────────────────────
  async findApproved(page = 1, limit = 10) {
    const [data, total] = await this.eventsRepository.findAndCount({
      where: { approved: true, visibilty: true, eventDate: MoreThan(new Date()) },
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


  async updateTicketSaleDates(
  eventId: number,
  ticketId: string,
  userId: number,
  dto: { startDate?: string; stopdate?: string },
): Promise<Event> {
  const event = await this.eventsRepository.findOneBy({ id: eventId });

  if (!event) throw new NotFoundException(`Event #${eventId} not found`);
  if (event.userId !== userId) throw new ForbiddenException('You do not own this event');

  if (!event.tickets || !Array.isArray(event.tickets)) {
    throw new BadRequestException('Event has no tickets');
  }

  const ticketIndex = event.tickets.findIndex((t) => t.id === ticketId);
  if (ticketIndex === -1) throw new NotFoundException(`Ticket "${ticketId}" not found`);

  event.tickets[ticketIndex] = {
    ...event.tickets[ticketIndex],
    ...(dto.startDate && { startDate: new Date(dto.startDate) }),
    ...(dto.stopdate && { stopdate: new Date(dto.stopdate) }),
  };

  await this.eventsRepository
    .createQueryBuilder()
    .update(Event)
    .set({ tickets: event.tickets })
    .where('id = :id', { id: eventId })
    .execute();

  // ✅ Fetch updated event and assert non-null — safe because we confirmed it exists above
  const updated = await this.eventsRepository.findOneBy({ id: eventId });
  if (!updated) throw new NotFoundException(`Event #${eventId} not found after update`);

  return updated;
}
  // ─── Track Visit ──────────────────────────────────────────────
  async trackVisit(eventId: number, ip?: string, userAgent?: string) {
    const event = await this.eventsRepository.findOne({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const exists = await this.visitRepository.findOne({
      where: {
        eventId,
        ipAddress: ip,
      },
    });

    if (exists) return; // prevent duplicate spam

    // ✅ FIX 2: userAgent is now saved
    return this.visitRepository.save(
      this.visitRepository.create({ eventId, ipAddress: ip, userAgent }),
    );
  }

  // ─── Get Event By Title (exact) ───────────────────────────────
  async findOne(name: string): Promise<Event> {
    const event = await this.eventsRepository.findOne({
      where: { title: ILike(name) }, // ✅ FIX 3: case-insensitive
      relations: ['user'],
      select: {
        user: {
          id: true,
          name: true,
          email: true,
          businessName: true,
        },
      },
    });

    if (!event) {
      throw new NotFoundException(`Event "${name}" not found`);
    }

    return event;
  }

  // ─── Get Event By ID ──────────────────────────────────────────
  async findOneById(id: number): Promise<Event> {
    const event = await this.eventsRepository.findOne({
      where: { id },
      relations: ['user'],
      select: {
        user: {
          id: true,
          name: true,
          email: true,
          businessName: true,
        },
      },
    });

    if (!event) {
      throw new NotFoundException(`Event #${id} not found`); // ✅ FIX 4: was using undefined `name`
    }

    return event;
  }

  // ─── Get Event By Title (search) ──────────────────────────────
  async findByTitle(title: string): Promise<Event[]> {
    const events = await this.eventsRepository.find({
      where: { title: ILike(`%${title}%`) },
      relations: ['user'],
      select: {
        user: { id: true, name: true, email: true, businessName: true },
      },
      order: { createdAt: 'DESC' },
    });

    if (!events.length) throw new NotFoundException(`No events found matching "${title}"`);
    return events;
  }

  // ─── Get Events By User ───────────────────────────────────────
  async findByUser(userId: number): Promise<Event[]> {
    return this.eventsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  // ─── Get Event + Ticket By IDs ────────────────────────────────
  async findByEventIdAndTicketId(eventId: number, ticketId: string) {
    const event = await this.eventsRepository.findOne({
      where: { id: Number(eventId) },
    });

    if (!event) {
      throw new NotFoundException(`Event "${eventId}" not found`);
    }

    if (!Array.isArray(event.tickets)) {
      throw new Error(`Invalid tickets structure for event ${eventId}`);
    }

    const ticket = event.tickets.find(
      (t) => String(t.id) === String(ticketId),
    );

    return ticket || null;
  }

  // ─── Get Events With Attendees By Email ───────────────────────
 async findEventsWithAttendeesByEmail(email: string): Promise<Event[]> {
  const events = await this.eventsRepository
    .createQueryBuilder('event')
    .leftJoinAndSelect('event.user', 'user')
    .leftJoin('event.attendees', 'attendee')
    .leftJoin('event.visits', 'visit')            // ✅ join visits
    .loadRelationCountAndMap('event.attendeesCount', 'event.attendees')
    .loadRelationCountAndMap('event.visitsCount', 'event.visits')  // ✅ count visits
    .where('user.email = :email', { email })
    .orderBy('event.createdAt', 'DESC')
    .getMany();

  if (!events.length) {
    return [];
  }

  return events;
}

  // ─── Update Event ─────────────────────────────────────────────
  async update(id: number, dto: UpdateEventDto, userId: number): Promise<Event> {
    const event = await this.eventsRepository.findOneBy({ id });
    if (!event) throw new NotFoundException(`Event #${id} not found`);
    if (event.userId !== userId) throw new ForbiddenException('You do not own this event');

    // ✅ FIX 5: explicit undefined check + guard against empty tickets array
    if (dto.tickets !== undefined) {
      if (dto.tickets.length === 0) {
        throw new BadRequestException('Cannot remove all tickets from an event');
      }

      const updatedTickets: Ticket[] = dto.tickets.map((ticket) => {
        const existing = event.tickets?.find((t) => t.type === ticket.type);
        return {
          ...ticket,
          id: existing ? existing.id : uuidv4(),
          qtySold: existing ? existing.qtySold : 0, // preserve sales
          startDate: new Date(ticket.startDate),
          stopdate: new Date(ticket.stopdate),
        };
      });
      event.tickets = updatedTickets;
    }

    const { tickets, ...rest } = dto;
    Object.assign(event, {
      ...rest,
      ...(dto.eventDate && { eventDate: new Date(dto.eventDate) }),
    });

    return this.eventsRepository.save(event);
  }

  // ─── Update Ticket Sold Qty ───────────────────────────────────
  async updateTicketQty(eventId: number, dto: UpdateTicketQtyDto): Promise<Event | null> {
    const event = await this.eventsRepository.findOneBy({ id: eventId });
    if (!event) throw new NotFoundException(`Event #${eventId} not found`);

    // ✅ FIX 6: guard before touching tickets — prevents overwriting with null/garbage
    if (!event.tickets || !Array.isArray(event.tickets) || event.tickets.length === 0) {
      throw new BadRequestException('Event has no tickets to update');
    }

    const ticketIndex = event.tickets.findIndex((t) => t.id === dto.ticketId);
    if (ticketIndex === -1) throw new NotFoundException(`Ticket not found`);

    const ticket = event.tickets[ticketIndex];
    const newQtySold = ticket.qtySold + dto.qtySold;

    if (newQtySold > ticket.startQty) {
      throw new BadRequestException(
        `Only ${ticket.startQty - ticket.qtySold} tickets remaining for "${ticket.type}"`,
      );
    }

    event.tickets[ticketIndex] = { ...ticket, qtySold: newQtySold };

    await this.eventsRepository
      .createQueryBuilder()
      .update(Event)
      .set({ tickets: event.tickets })
      .where('id = :id', { id: eventId })
      .execute();

    return this.eventsRepository.findOneBy({ id: eventId });
  }

  // ─── Delete Event ─────────────────────────────────────────────
  async remove(id: number, userId: number): Promise<{ message: string }> {
    const event = await this.eventsRepository.findOneBy({ id });
    if (!event) throw new NotFoundException(`Event #${id} not found`);
    if (event.userId !== userId) throw new ForbiddenException('You do not own this event');

    await this.eventsRepository.remove(event);
    return { message: `Event #${id} deleted successfully` };
  }

  // ─── Dashboard Overview ───────────────────────────────────────
  async getDashboardOverview(userId: number) {
    const events = await this.eventsRepository.find({
      where: { userId },
      relations: ['attendees'],
    });

    const now = new Date();

    const totalEvents = events.length;
    const totalTicketsSold = events.reduce((acc, e) => acc + e.attendees.length, 0);
    const totalRevenue = events.reduce(
      (acc, e) => acc + e.attendees.reduce((sum, a) => sum + Number(a.amount), 0),
      0,
    );

    const upcomingEvents = events
      .filter((e) => new Date(e.eventDate) > now)
      .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
      .slice(0, 5)
      .map((e) => ({
        id: e.id,
        title: e.title,
        eventDate: e.eventDate,
        venue: e.venue,
        ticketsSold: e.attendees.length,
      }));

    return {
      stats: {
        totalEvents,
        totalTicketsSold,
        totalRevenue,
        // ✅ FIX 7: removed duplicate totalAttendees (was identical to totalTicketsSold)
      },
      upcomingEvents,
    };
  }
}