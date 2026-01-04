import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { Event } from '../entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() eventData: CreateEventDto): Promise<Event> {
    return await this.eventsService.create(eventData);
  }

  @Get()
  async findAll(@Query('city') city?: string): Promise<Event[]> {
    return await this.eventsService.findAll(city);
  }

  @Get('my/:authorId')
  async findByAuthor(@Param('authorId') authorId: string): Promise<Event[]> {
    return await this.eventsService.findByAuthor(authorId);
  }

  @Get('participant/:userId')
  async findByParticipant(@Param('userId') userId: string): Promise<Event[]> {
    return await this.eventsService.findByParticipant(userId);
  }

  @Post('participants/remove')
  @HttpCode(HttpStatus.OK)
  async removeParticipant(
    @Body() body: { eventId: string; userId: string; authorId: string },
  ): Promise<Event> {
    if (!body?.authorId) {
      throw new Error('authorId is required');
    }
    if (!body?.userId) {
      throw new Error('userId is required');
    }
    if (!body?.eventId) {
      throw new Error('eventId is required');
    }
    return await this.eventsService.removeParticipant(body.eventId, body.userId, body.authorId);
  }

  @Put(':id/delete')
  @HttpCode(HttpStatus.OK)
  async delete(
    @Param('id') id: string,
    @Body() body: { authorId: string },
  ) {
    if (!body?.authorId) {
      throw new Error('authorId is required');
    }
    try {
      await this.eventsService.delete(id, body.authorId);
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }

  @Get(':id/requests')
  async getRequests(@Param('id') eventId: string) {
    return await this.eventsService.getRequests(eventId);
  }

  @Post(':id/requests')
  @HttpCode(HttpStatus.CREATED)
  async createRequest(
    @Param('id') eventId: string,
    @Body() body: { userId: string },
  ) {
    return await this.eventsService.createRequest(eventId, body.userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Event | null> {
    const event = await this.eventsService.findOne(id);
    if (!event) {
      throw new Error('Event not found');
    }
    return event;
  }

  @Put('requests/:requestId/approve')
  async approveRequest(@Param('requestId') requestId: string): Promise<Event> {
    return await this.eventsService.approveRequest(requestId);
  }

  @Put('requests/:requestId/reject')
  @HttpCode(HttpStatus.NO_CONTENT)
  async rejectRequest(@Param('requestId') requestId: string): Promise<void> {
    return await this.eventsService.rejectRequest(requestId);
  }

  @Post(':id/leave')
  @HttpCode(HttpStatus.OK)
  async leaveEvent(
    @Param('id') eventId: string,
    @Body() body: { userId: string },
  ): Promise<Event> {
    if (!body?.userId) {
      throw new Error('userId is required');
    }
    return await this.eventsService.leaveEvent(eventId, body.userId);
  }
}

