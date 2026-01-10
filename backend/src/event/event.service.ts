import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Event } from './event.entity';
import { CheckIn } from '../checkIn/checkIn.entity';
import { Repository } from 'typeorm';
import { Junior } from '../junior/entities';
import { EntryType } from '../extraEntry/entities';
import { ExtraEntry } from '../extraEntry/entities';
import { EntryPermit } from '../extraEntry/entities/entryPermit.entity';
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
        @InjectRepository(EntryType)
        private readonly entryTypeRepo: Repository<EntryType>,
        @InjectRepository(ExtraEntry)
        private readonly extraEntryRepo: Repository<ExtraEntry>,
        @InjectRepository(EntryPermit)
        private readonly entryPermitRepo: Repository<EntryPermit>,
        private readonly kompassiService: KompassiService
    ) {}

    private getExtraEntryTypeName(eventName: string, startDate?: Date | null): string {
        if (startDate) {
            const formattedDate = new Date(startDate).toLocaleDateString('fi-FI');
            return `Tapahtuma ${formattedDate}: ${eventName}`;
        }
        return `Tapahtuma: ${eventName}`;
    }

    async getEventById(EventId: number): Promise<Event> {
        return (await this.eventRepo.createQueryBuilder('Event')
            .leftJoinAndSelect('Event.extraEntryType', 'extraEntryType')
            .where({ id: EventId })
            .getOne());
    }

    async getEvents(): Promise<EventViewModel[]> {
        return (await this.eventRepo.createQueryBuilder('Event')
            .leftJoinAndSelect('Event.extraEntryType', 'extraEntryType')
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

    async createEvent(data: CreateEventDto, userId?: string): Promise<Event> {
        this.logger.log({ hasExtraEntry: data.hasExtraEntry, startDate: data.startDate, name: data.name }, 'Creating event with data');
        let extraEntryType: EntryType | undefined;

        if (data.hasExtraEntry) {
            const typeName = this.getExtraEntryTypeName(data.name, data.startDate);
            this.logger.log({ typeName }, 'Creating extra entry type');
            extraEntryType = {
                name: typeName,
                expiryAge: 99
            } as EntryType;
        }

        const newEvent = this.eventRepo.create({
            name: data.name,
            description: data.description,
            startDate: data.startDate,
            integrationId: data.integrationId,
            extraEntryType: extraEntryType
        });

        await this.eventRepo.save(newEvent);
        this.logger.log({ userId, eventId: newEvent.id }, 'User created event.');
        return newEvent;
    }

    async editEvent(data: EditEventDto, userId?: string): Promise<string> {
        const event = await this.eventRepo.findOne({
            where: { id: data.id },
            relations: ['extraEntryType']
        });
        if (!event) { throw new BadRequestException(content.EventNotFound); }

        const hadExtraEntry = !!event.extraEntryType;
        const willHaveExtraEntry = data.hasExtraEntry;

        if (!hadExtraEntry && willHaveExtraEntry) {
            const newExtraEntryType = this.entryTypeRepo.create({
                name: this.getExtraEntryTypeName(data.name, data.startDate),
                expiryAge: 99
            });
            event.extraEntryType = await this.entryTypeRepo.save(newExtraEntryType);
        } else if (hadExtraEntry && !willHaveExtraEntry) {

            const extraEntryTypeId = event.extraEntryType.id;
            const [extraEntriesCount, entryPermitsCount] = await Promise.all([
                this.extraEntryRepo.count({
                    where: { entryType: { id: extraEntryTypeId } }
                }),
                this.entryPermitRepo.count({
                    where: { entryType: { id: extraEntryTypeId } }
                })
            ]);

            if (extraEntriesCount > 0 || entryPermitsCount > 0) {
                throw new BadRequestException(content.ExtraEntryTypeInUse);
            }

            const entryTypeToRemove = event.extraEntryType;
            event.extraEntryType = null;
            await this.eventRepo.save(event);
            await this.entryTypeRepo.remove(entryTypeToRemove);

        } else if (hadExtraEntry && willHaveExtraEntry) {
            event.extraEntryType.name = this.getExtraEntryTypeName(data.name, data.startDate);
            await this.entryTypeRepo.save(event.extraEntryType);
        }

        event.name = data.name;
        event.description = data.description;
        event.startDate = data.startDate;
        event.integrationId = data.integrationId;

        await this.eventRepo.save(event);
        this.logger.log({ userId, eventId: event.id }, 'User modified event.');
        return `${data.id} ${content.Updated}`;
    }

    async deleteEvent(id: number, userId?: string): Promise<string> {
        const event = await this.eventRepo.findOne({
            where: { id },
            relations: ['extraEntryType']
        });
        if (!event) { throw new BadRequestException(content.EventNotFound); }

        // If the event has an associated extra entry type, delete all related entries.
        if (event.extraEntryType) {
            const extraEntryTypeId = event.extraEntryType.id;
            await this.extraEntryRepo.delete({ entryType: { id: extraEntryTypeId } });
            await this.entryPermitRepo.delete({ entryType: { id: extraEntryTypeId } });
            await this.entryTypeRepo.remove(event.extraEntryType);
        }

        await this.eventRepo.remove(event);
        this.logger.log({ userId, eventId: id }, 'User deleted event.');
        return `${id} ${content.Deleted}`;
    }

}
