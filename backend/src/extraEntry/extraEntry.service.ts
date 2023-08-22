import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Repository, DeleteResult } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as content from '../content';
import { ExtraEntry } from './entities';
import { ExtraEntryType } from './entities';
import { ExtraEntryTypeViewModel } from './vm/extraEntryType.vm';
import { CreateExtraEntryTypeDto } from './dto/createType.dto';
import { CreateExtraEntryDto } from './dto/create.dto';
import { ConfigHelper } from 'src/configHandler';
import { Junior } from 'src/junior/entities';
import { getFilters } from 'src/utils/helpers';
import { ListControlDto } from 'src/common/dto';
import { ExtraEntryListViewModel } from './vm/extraEntryList.vm';
import { JuniorExtraEntriesViewModel } from './vm/juniorExtraEntries.vm';
import { JuniorService } from 'src/junior/junior.service';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class ExtraEntryService {
    private readonly logger = new Logger('Extra entry Service');

    constructor(
        @InjectRepository(ExtraEntryType)
        private readonly extraEntryTypeRepo: Repository<ExtraEntryType>,
        @InjectRepository(ExtraEntry)
        private readonly extraEntryRepo: Repository<ExtraEntry>,
        @InjectRepository(Junior)
        private readonly juniorRepo: Repository<Junior>,
        private readonly juniorService: JuniorService,
        ) { }

    async createExtraEntry(details: CreateExtraEntryDto, userId?: string): Promise<string> {
        if (userId && ConfigHelper.detailedLogs()) {
            this.logger.log({ userId: userId, juniorId: details.juniorId }, `User created an extra entry for junior.`);
        };

        const junior = await this.juniorRepo.findOneBy({ id: details.juniorId });
        if (!junior) throw new BadRequestException(content.UserNotFound);
        const eeType = await this.extraEntryTypeRepo.findOneBy({ id: details.extraEntryTypeId });
        if (!eeType) throw new BadRequestException(content.TypeNotFound);
        const newEntry = {junior: junior, extraEntryType: eeType};
        this.extraEntryRepo.save(newEntry);

        return `${details.juniorId} ${content.Updated}`;
    };

    async deleteExtraEntry(extraEntryId: number, userId?: string): Promise<string> {
        const extraEntry = await this.extraEntryRepo.createQueryBuilder('extraEntry')
            .leftJoinAndSelect('extraEntry.junior', 'junior')
            .where('extraEntry.id = :id', { id: extraEntryId })
            .getOne();
        if (!extraEntry) throw new BadRequestException(content.ExtraEntryNotFound);
        const juniorId = extraEntry?.junior?.id;

        if (userId && ConfigHelper.detailedLogs()) {
            this.logger.log({ userId: userId, juniorId: juniorId }, `User deleted extra entry from junior.`);
        };

        await this.extraEntryRepo.remove(extraEntry);
        return `${juniorId} ${content.Updated}`;
    };

    async getExtraEntryType(id: number): Promise<ExtraEntryTypeViewModel> {
        return (await this.extraEntryTypeRepo.findOneBy({ id }));
    };

    async getAllExtraEntryTypes(): Promise<ExtraEntryTypeViewModel[]> {
        return (await this.extraEntryTypeRepo.find()).map(extraEntryType => new ExtraEntryTypeViewModel(extraEntryType));
    };

    async createExtraEntryType(extraEntryData: CreateExtraEntryTypeDto): Promise<string> {
        const extraEntryType = {
            name: extraEntryData.name,
            expiryAge: extraEntryData.expiryAge,
        };
        await this.extraEntryTypeRepo.save(extraEntryType);
        return content.ExtraEntryTypeSaved;
    };

    // Similar function can be made for juniors checkIns when needed: simply replace extraEntries with checkIns
    async getExtraEntriesForJunior(id: string, userId?: string): Promise<JuniorExtraEntriesViewModel> {
        if (userId && ConfigHelper.detailedLogs()) {
            this.logger.log({ userId: userId, juniorId: id }, `User fetched extra entries for junior.`);
        };

        const junior = await this.juniorRepo.createQueryBuilder('user')
            .leftJoinAndSelect('user.extraEntries', 'extraEntry')
            .leftJoinAndSelect('extraEntry.extraEntryType', 'extraEntryType')
            .where('user.id = :id', { id: id })
            .getOne();

        return new JuniorExtraEntriesViewModel(junior);
    }

    async getAllExtraEntries(controls?: ListControlDto, userId?: string): Promise<ExtraEntryListViewModel> {
        const filters = getFilters(controls);
        let juniorEntities = await (this.juniorService.getAllJuniorsQuery(filters, true)).getMany();

        // Sorting and filtering of extra entries is easier done here than in database
        if (controls?.filters?.extraEntryType) {
            // -1 = no extra entries
            if (controls?.filters?.extraEntryType === -1) {
                juniorEntities = juniorEntities.filter(j => Array.isArray(j.extraEntries) && j.extraEntries.length === 0);
            // -2 = any extra entry
            } else if (controls?.filters?.extraEntryType === -2) {
                juniorEntities = juniorEntities.filter(j => Array.isArray(j.extraEntries) && j.extraEntries.length > 0);
            } else {
                juniorEntities = juniorEntities.filter(j => j.extraEntries.find(ee => ee.extraEntryType.id === controls.filters.extraEntryType));
            }
        }

        if (controls?.sort?.field === "extraEntries") {
            if (controls?.sort?.order === "DESC") juniorEntities = juniorEntities.sort((a,b) => a.extraEntries.length - b.extraEntries.length);
            if (controls?.sort?.order === "ASC") juniorEntities = juniorEntities.sort((a,b) => b.extraEntries.length - a.extraEntries.length);
        }

        const juniors = (controls ? juniorEntities.slice(filters.skip, filters.skip + filters.take) : juniorEntities).map(e => new JuniorExtraEntriesViewModel(e));

        if (userId && ConfigHelper.detailedLogs()) {
            this.logger.log({ userId: userId, juniorIds: juniors.map(junior => junior.id) }, `User fetched extra entries for juniors.`);
        }

        return new ExtraEntryListViewModel(juniors, juniorEntities.length);
    }

    // Delete expired extra entries and clean up extra entry registry juniors every night at 4 AM
    @Cron('0 4 * * *')
    async cleanUpExtraEntryRegistry(): Promise<void> {
        this.logger.log("Cleaning up extra entry registry.");
        const juniorExtraEntries = (await this.getAllExtraEntries()).data;
        const expiredExtraEntries = [];

        for (let junior of juniorExtraEntries) {
            for (let ee of junior.extraEntries) {
                if (junior.age >= ee.extraEntryType.expiryAge) {
                    expiredExtraEntries.push(ee.id);
                }
            }
            // TODO: extra entry permits
        }

        if (expiredExtraEntries.length > 0) {
            const deleted: DeleteResult = await this.extraEntryRepo.createQueryBuilder()
                .where('extra_entry.id IN (:...expiredIds)', { expiredIds: expiredExtraEntries })
                .delete()
                .execute();
            this.logger.log(`Deleted ${deleted.affected} expired extra entries.`);
        }

        await this.juniorService.cleanUpExtraEntryJuniors();
    }
};

