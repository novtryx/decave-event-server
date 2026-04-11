// src/attendees/attendees.controller.ts
import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Query } from '@nestjs/common';
import { AttendeesService } from './attendees.service';
import { CreateAttendeeDto } from './dto/create-attendees.dto';
import { UpdateAttendeesDto } from './dto/update-attendees.dto';
import { JwtAuthGuard } from 'src/auth/jwt.guard';

@Controller('attendees')
export class AttendeesController {
  constructor(private readonly attendeesService: AttendeesService) {}
 
  @Post()
  create(@Body() createDto: CreateAttendeeDto) {
    return this.attendeesService.create(createDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.attendeesService.findAll();
  }

  @Get("ref")
  findByRef(@Query("ref") ref: string) {
    return this.attendeesService.findByPaystackId(ref);
  }

  @UseGuards(JwtAuthGuard)
  @Get('event/:eventId')
findByEventId(
  @Param('eventId') eventId: string,
  @Query('page') page: string = '1',
  @Query('limit') limit: string = '20',
) {
  return this.attendeesService.findByEventId(
    Number(eventId),
    Number(page),
    Number(limit),
  );
}

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attendeesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateAttendeesDto) {
    return this.attendeesService.update(id, updateDto);
  }
  
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.attendeesService.remove(id);
  }
}
