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
