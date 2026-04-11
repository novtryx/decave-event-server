import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Event, Ticket } from './event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { UpdateTicketQtyDto } from './dto/update-ticket-qty.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
  ) {}

  // ─── Create Event ─────────────────────────────────────────────
  async create(dto: CreateEventDto, userId: number): Promise<Event> {
    const tickets: Ticket[] = dto.tickets.map((ticket) => ({
      ...ticket,
      id: uuidv4(),
      qtySold: 0, // always start at 0
      startDate: new Date(ticket.startDate),
      stopdate: new Date(ticket.stopdate),
    }));

    const event = this.eventsRepository.create({
      ...dto,
      eventDate: new Date(dto.eventDate),
      tickets,
      userId,
    });

    return this.eventsRepository.save(event);
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


//we have fixes here

  // ─── Get Event By ID ──────────────────────────────────────────
  async findOne(name: string): Promise<Event> {
  const event = await this.eventsRepository.findOne({
    where: { title: name }, // ✅ use name
    relations: ["user"],
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

 async findOneById(id: number): Promise<Event> {
  const event = await this.eventsRepository.findOne({
    where: { id }, // ✅ use name
    relations: ["user"],
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

  //we have fixes here

  // ─── Get Event By Title ───────────────────────────────────────
  async findByTitle(title: string): Promise<Event[]> {
    const events = await this.eventsRepository.find({
      where: { title: ILike(`%${title}%`) }, // case-insensitive search
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

  // ─── Get Events for a Specific User BY EMAIL WITH Attendees ─────────────
async findEventsWithAttendeesByEmail(email: string): Promise<Event[]> {
  const events = await this.eventsRepository
    .createQueryBuilder('event')
    .leftJoinAndSelect('event.user', 'user')
    .leftJoin('event.attendees', 'attendee')        // join but don't select
    .loadRelationCountAndMap(                        // just load the count
      'event.attendeesCount',                        // maps to this virtual field
      'event.attendees'
    )
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

    // Handle tickets update — preserve qtySold, regenerate ids for new tickets
    if (dto.tickets) {
      const updatedTickets: Ticket[] = dto.tickets.map((ticket) => {
        // check if ticket already exists (has matching type) to preserve qtySold
        const existing = event.tickets.find((t) => t.type === ticket.type);
        return {
          ...ticket,
          id: existing ? existing.id : uuidv4(), // keep old id or generate new
          qtySold: existing ? existing.qtySold : 0, // preserve sales
          startDate: new Date(ticket.startDate),
          stopdate: new Date(ticket.stopdate),
        };
      });
      event.tickets = updatedTickets;
    }

    // Update all other fields except tickets (already handled above)
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

    // mark jsonb as modified so TypeORM detects the change
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

  async getDashboardOverview(userId: number) {
  // all user events
  const events = await this.eventsRepository.find({
    where: { userId },
    relations: ['attendees'],
  });

  const now = new Date();

  // stats
  const totalEvents = events.length;
  const totalTicketsSold = events.reduce((acc, e) => acc + e.attendees.length, 0);
  const totalRevenue = events.reduce(
    (acc, e) => acc + e.attendees.reduce((sum, a) => sum + Number(a.amount), 0),
    0,
  );
  const totalAttendees = totalTicketsSold; // same thing — each attendee = one ticket

  // upcoming events (future date, sorted soonest first, max 5)
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
      totalAttendees,
    },
    upcomingEvents,
  };
}
}