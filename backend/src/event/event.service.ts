import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Event } from './event.entity';
import { CheckIn } from '../checkIn/checkIn.entity';
import { Repository } from 'typeorm';
import { Junior } from '../junior/entities';
import { EventViewModel } from './event.vm';
import * as content from '../content';
import { CheckInDto } from '../checkIn/checkIn.dto';
import { CreateEventDto } from './create.dto';
import { EditEventDto } from './edit.dto';
import { KompassiService } from '../kompassi/kompassi.service';

@Injectable()
export class EventService {

    private readonly logger = new Logger('Event Service');

    constructor(
        @InjectRepository(Junior)
        private readonly juniorRepo: Repository<Junior>,
        @InjectRepository(CheckIn)
        private readonly checkInRepo: Repository<CheckIn>,
        @InjectRepository(Event)
        private readonly eventRepo: Repository<Event>,
        private readonly kompassiService: KompassiService
    ) {}

    async getEventById(EventId: number): Promise<Event> {
        return (await this.eventRepo.createQueryBuilder('Event')
            .where({ id: EventId })
            .getOne());
    }

    async getEvents(): Promise<EventViewModel[]> {
        return (await this.eventRepo.createQueryBuilder('Event')
            .getMany())
            .map(Event => new EventViewModel(Event));
    }

    async getCheckInsForEvent(eventId: number): Promise<CheckIn[]> {
        const event = await this.eventRepo.findOneBy({ id: eventId });
        if (!event) { throw new BadRequestException(content.EventNotFound); }
        return await this.checkInRepo.find({ where: { event }, relations: ['event', 'junior'] });
    }

    async checkInJunior(checkInData: CheckInDto): Promise<boolean> {
        const [junior, event] = await Promise.all([
            this.juniorRepo.findOneBy({ id: checkInData.juniorId }),
            this.eventRepo.createQueryBuilder('event')
                .where({ id: checkInData.targetId })
                .getOne()
        ]);
        if (!junior) { throw new BadRequestException(content.UserNotFound); }
        if (!event) { throw new BadRequestException(content.EventNotFound); }

        await this.checkInRepo.save({ junior, event, checkInTime: new Date() });

        // Intentionally not awaited.
        if (event.integrationId) this.kompassiService.checkInForKompassiActivity(junior, event.integrationId);

        return true;
    }

    async createEvent(data: CreateEventDto): Promise<Event> {
        const newEvent = this.eventRepo.create({
            name: data.name,
            description: data.description,
            startDate: data.startDate,
            integrationId: data.integrationId
        });

        await this.eventRepo.save(newEvent);
        return newEvent;
    }

    async editEvent(data: EditEventDto): Promise<string> {
        const Event = await this.eventRepo.findOneBy({ id: data.id });
        if (!Event) { throw new BadRequestException(content.EventNotFound); };
        Event.id = data.id;
        Event.name = data.name;
        Event.description = data.description;
        Event.startDate = data.startDate;
        Event.integrationId = data.integrationId;

        await this.eventRepo.save(Event);
        return `${data.id} ${content.Updated}`;
    }

    async deleteEvent(id: number): Promise<string> {
        const event = await this.eventRepo.findOneBy({ id });
        if (!event) { throw new BadRequestException(content.EventNotFound); }
        await this.eventRepo.remove(event);
        return `${id} ${content.Deleted}`;
    }

}
