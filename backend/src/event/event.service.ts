import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Event } from './event.entity';
import { CheckIn } from '../checkIn/checkIn.entity';
import { Repository } from 'typeorm';
import { Junior } from '../junior/entities';
import { EventViewModel } from './event.vm';
import { CheckInStatsViewModel } from '../checkIn/vm';
import * as content from '../content';
import { CheckInDto } from '../checkIn/checkIn.dto';
import { CheckInStatsSettingsDto } from '../checkIn/checkInStatsSettings.dto';
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
            .leftJoinAndSelect('Event.kompassiIntegration', 'kompassiIntegration')
            .where({ id: EventId })
            .getOne());
    }

    async getEvents(): Promise<EventViewModel[]> {
        return (await this.eventRepo.createQueryBuilder('Event')
            .leftJoinAndSelect('Event.kompassiIntegration', 'kompassiIntegration')
            .getMany())
            .map(Event => new EventViewModel(Event));
    }

    async getCheckIns(eventId: number): Promise<CheckIn[]> {
        const event = await this.eventRepo.findOneBy({ id: eventId });
        if (!event) { throw new BadRequestException(content.EventNotFound); }
        return await this.checkInRepo.find({ where: { event }, relations: ['event', 'junior'] });
    }

    async checkInJunior(checkInData: CheckInDto): Promise<boolean> {
        const [junior, Event] = await Promise.all([
            this.juniorRepo.findOneBy({ id: checkInData.juniorId }),
            this.eventRepo.createQueryBuilder('Event')
                .leftJoinAndSelect('Event.kompassiIntegration', 'kompassiIntegration')
                .where({ id: checkInData.targetId })
                .getOne()
        ]);
        if (!junior) { throw new BadRequestException(content.UserNotFound); }
        if (!Event) { throw new BadRequestException(content.EventNotFound); }

        await this.checkInRepo.save({ junior, Event, checkInTime: new Date() });

        // Intentionally not awaited.
        //this.kompassiService.updateKompassiData(junior, Event);

        return true;
    }

    async editEvent(data: EditEventDto): Promise<string> {
        const Event = await this.eventRepo.findOneBy({ id: data.id });
        if (!Event) { throw new BadRequestException(content.EventNotFound); };
        Event.id = data.id;
        Event.name = data.name;
        Event.description = data.description;
        Event.startDate = data.startDate;
        Event.kompassiIntegration = data.kompassiIntegration;

        await this.eventRepo.save(Event);
        return `${data.id} ${content.Updated}`;
    }

}
