// src/attendees/attendees.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendees } from './attendees.entity';
import { CreateAttendeeDto } from './dto/create-attendees.dto';
import { UpdateAttendeesDto } from './dto/update-attendees.dto';

@Injectable()
export class AttendeesService {
  constructor(
    @InjectRepository(Attendees)
    private readonly attendeesRepo: Repository<Attendees>,
  ) {}

  async create(createDto: CreateAttendeeDto): Promise<Attendees> {
    const attendee = this.attendeesRepo.create(createDto);
    return this.attendeesRepo.save(attendee);
  }

  findAll(): Promise<Attendees[]> {
    return this.attendeesRepo.find({ relations: ['event'] });
  }

  async findOne(id: string): Promise<Attendees> {
    const attendee = await this.attendeesRepo.findOne({
      where: { id },
      relations: ['event'],
    });
    if (!attendee) throw new NotFoundException(`Attendee ${id} not found`);
    return attendee;
  }

  // Add this to your existing AttendeesService

async findByEventId(
  eventId: number,
  page: number = 1,
  limit: number = 20,
): Promise<{
  data: Attendees[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const skip = (page - 1) * limit;

  const [data, total] = await this.attendeesRepo.findAndCount({
    where: { eventId },
    relations: ['event'],
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      ticketType: true,
      amount: true,
      checkedIn: true,
      qrCode: true,
      paystackId: true,
       createdAt: true,
      event: {
        id: true,
        title: true,
        type: true,
        description: true,
        venue: true,
        visibilty: true,
        address: true,
        eventDate: true,
        theme: true,
      },
    },
    skip,
    take: limit,
    order: { createdAt: 'DESC' },
  });

  if (!data.length) {
    throw new NotFoundException(`No attendees found for eventId "${eventId}"`);
  }

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}


 async findByPaystackId(paystackId: string): Promise<Attendees[]> {
  const attendees = await this.attendeesRepo.find({
    where: { paystackId },
    relations: ['event'],
    select: {
      // your attendee fields (add whatever you need)
      id: true,
      name: true,
      email: true,
      phone: true,
      ticketType: true,
      amount: true,
      checkedIn: true,
      qrCode: true,
      paystackId: true,
      event: {
        id: true,
        title: true,
        type: true,
        description: true,
        venue: true,
        visibilty: true,
        address: true,
        eventDate: true,
        theme: true,
      },
    },
  });

  if (!attendees.length) {
    throw new NotFoundException(`No attendees found for paystackId "${paystackId}"`);
  }

  return attendees;
}
  async update(id: string, updateDto: UpdateAttendeesDto): Promise<Attendees> {
    const attendee = await this.findOne(id);
    Object.assign(attendee, updateDto); 
    return this.attendeesRepo.save(attendee);
  }

  async remove(id: string): Promise<void> {
    const attendee = await this.findOne(id);
    await this.attendeesRepo.remove(attendee);
  }
}
