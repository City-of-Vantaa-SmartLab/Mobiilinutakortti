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

    private getPermitName(eventName: string, startDate?: Date | null): string {
        if (startDate) {
            const formattedDate = new Date(startDate).toLocaleDateString('fi-FI');
            return `Tapahtuma ${formattedDate}: ${eventName}`;
        }
        return `Tapahtuma: ${eventName}`;
    }

    async getEventById(EventId: number): Promise<Event> {
        return (await this.eventRepo.createQueryBuilder('Event')
            .leftJoinAndSelect('Event.permit', 'permit')
            .where({ id: EventId })
            .getOne());
    }

    async getEvents(): Promise<EventViewModel[]> {
        return (await this.eventRepo.createQueryBuilder('Event')
            .leftJoinAndSelect('Event.permit', 'permit')
            .getMany())
            .map(Event => new EventViewModel(Event));
    }

    async getCheckInsForEvent(eventId: number): Promise<CheckIn[]> {
        const event = await this.eventRepo.findOneBy({ id: eventId });
        if (!event) { throw new BadRequestException(content.EventNotFound); }
        return await this.checkInRepo.find({ where: { event }, relations: ['event', 'junior'] });
    }

    async checkJuniorHasPermit(checkInData: CheckInDto): Promise<boolean> {
        const [junior, event] = await Promise.all([
            this.juniorRepo.findOne({
                where: { id: checkInData.juniorId },
                relations: ['entryPermits', 'entryPermits.entryType']
            }),
            this.eventRepo.createQueryBuilder('event')
                .leftJoinAndSelect('event.permit', 'permit')
                .where({ id: checkInData.targetId })
                .getOne()
        ]);
        if (!junior) { throw new BadRequestException(content.UserNotFound); }
        if (!event) { throw new BadRequestException(content.EventNotFound); }

        // If event requires an entry permit, check the junior has it.
        if (event.permit) {
            const hasPermit = junior.entryPermits?.some(
                permit => permit.entryType.id === event.permit.id
            );
            return hasPermit;
        }

        // Event doesn't require a permit.
        return true;
    }

    // Returns nick name or first name of the junior on success.
    async checkInJunior(checkInData: CheckInDto): Promise<string> {
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
        if (event.integrationId) this.kompassiService.checkInToKompassiActivity(junior, event.integrationId);

        return junior.nickName ? junior.nickName : junior.firstName;
    }

    async createEvent(data: CreateEventDto, userId?: string): Promise<Event> {
        let permit: EntryType | undefined;

        if (data.needsPermit) {
            const permitName = this.getPermitName(data.name, data.startDate);
            this.logger.debug({ typeName: permitName }, 'Creating entry type');
            permit = {
                name: permitName,
                expiryAge: 99
            } as EntryType;
        }

        const newEvent = this.eventRepo.create({
            name: data.name,
            description: data.description,
            startDate: data.startDate,
            integrationId: data.integrationId,
            permit: permit
        });

        await this.eventRepo.save(newEvent);
        this.logger.log({ userId, eventId: newEvent.id }, 'User created event.');
        return newEvent;
    }

    async editEvent(data: EditEventDto, userId?: string): Promise<string> {
        const event = await this.eventRepo.findOne({
            where: { id: data.id },
            relations: ['permit']
        });
        if (!event) { throw new BadRequestException(content.EventNotFound); }

        const hadPermit = !!event.permit;

        if (!hadPermit && data.needsPermit) {
            const newPermit = this.entryTypeRepo.create({
                name: this.getPermitName(data.name, data.startDate),
                expiryAge: 99
            });
            event.permit = await this.entryTypeRepo.save(newPermit);
        } else if (hadPermit && !data.needsPermit) {

            const permitId = event.permit.id;
            const [extraEntriesCount, entryPermitsCount] = await Promise.all([
                this.extraEntryRepo.count({
                    where: { entryType: { id: permitId } }
                }),
                this.entryPermitRepo.count({
                    where: { entryType: { id: permitId } }
                })
            ]);

            if (extraEntriesCount > 0 || entryPermitsCount > 0) {
                throw new BadRequestException(content.ExtraEntryTypeInUse);
            }

            const entryTypeToRemove = event.permit;
            event.permit = null;
            await this.eventRepo.save(event);
            await this.entryTypeRepo.remove(entryTypeToRemove);

        } else if (hadPermit && data.needsPermit) {
            event.permit.name = this.getPermitName(data.name, data.startDate);
            await this.entryTypeRepo.save(event.permit);
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
            relations: ['permit']
        });
        if (!event) { throw new BadRequestException(content.EventNotFound); }

        // No need for a check-in log anymore, either.
        await this.checkInRepo.delete({ event: { id } });

        const associatedPermit = event.permit;
        await this.eventRepo.remove(event);

        // If the event has an associated entry type, delete all related entries and permits.
        if (associatedPermit) {
            await this.extraEntryRepo.delete({ entryType: { id: associatedPermit.id } });
            await this.entryPermitRepo.delete({ entryType: { id: associatedPermit.id } });
            await this.entryTypeRepo.remove(associatedPermit);
        }

        this.logger.log({ userId, eventId: id }, 'User deleted event.');
        return `${id} ${content.Deleted}`;
    }

}
