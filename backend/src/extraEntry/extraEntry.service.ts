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
import { Permit } from './entities/permit.entity';

@Injectable()
export class ExtraEntryService {
    private readonly logger = new Logger('Extra entry Service');

    constructor(
        @InjectRepository(ExtraEntryType)
        private readonly extraEntryTypeRepo: Repository<ExtraEntryType>,
        @InjectRepository(ExtraEntry)
        private readonly extraEntryRepo: Repository<ExtraEntry>,
        @InjectRepository(Permit)
        private readonly permitRepo: Repository<Permit>,
        @InjectRepository(Junior)
        private readonly juniorRepo: Repository<Junior>,
        private readonly juniorService: JuniorService,
        ) { }

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
    async getExtraEntriesForJunior(id: string): Promise<JuniorExtraEntriesViewModel> {
        const junior = await this.juniorRepo.createQueryBuilder('user')
            .leftJoinAndSelect('user.extraEntries', 'extraEntry')
            .leftJoinAndSelect('extraEntry.extraEntryType', 'extraEntryType')
            .leftJoinAndSelect('user.permits', 'permit')
            .leftJoinAndSelect('permit.permitType', 'permitType')
            .where('user.id = :id', { id: id })
            .getOne();

        return new JuniorExtraEntriesViewModel(junior);
    }

    async getAllExtraEntries(controls?: ListControlDto): Promise<ExtraEntryListViewModel> {
        const sortField = controls?.sort?.field;
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

        if (controls?.filters?.permitType) {
            // -1 = no permits
            if (controls?.filters?.permitType === -1) {
                juniorEntities = juniorEntities.filter(j => Array.isArray(j.permits) && j.permits.length === 0);
            // -2 = any permit
            } else if (controls?.filters?.permitType === -2) {
                juniorEntities = juniorEntities.filter(j => Array.isArray(j.permits) && j.permits.length > 0);
            } else {
                juniorEntities = juniorEntities.filter(j => j.permits.find(ee => ee.permitType.id === controls.filters.permitType));
            }
        }

        if (sortField === "extraEntries" || sortField === "permits") {
            if (controls?.sort?.order === "DESC") juniorEntities = juniorEntities.sort((a,b) => a[sortField].length - b[sortField].length);
            if (controls?.sort?.order === "ASC") juniorEntities = juniorEntities.sort((a,b) => b[sortField].length - a[sortField].length);
        }

        const juniors = (controls ? juniorEntities.slice(filters.skip, filters.skip + filters.take) : juniorEntities).map(e => new JuniorExtraEntriesViewModel(e));

        return new ExtraEntryListViewModel(juniors, juniorEntities.length);
    }

    async deletePermitIfAddedAsEntry(juniorId: string, deletableType: number, userId?: string): Promise<boolean> {
        const juniorWithPermits = await this.getExtraEntriesForJunior(juniorId);
        const deletablePermit = juniorWithPermits.permits.find((permit) => {
            return permit.permitType.id === deletableType;
        });
        if (deletablePermit) {
            this.deleteEntry(deletablePermit.id, userId, true);
            return true;
        } else {
            return false;
        }
    };

    async createEntry(details: CreateExtraEntryDto, userId?: string): Promise<string> {
        const isPermit = details.isPermit;

        if (userId && ConfigHelper.detailedLogs()) {
            this.logger.log({ userId: userId, juniorId: details.juniorId, entryTypeId: details.entryTypeId }, `User created ${isPermit ? "a permit" : "an extra entry"} for junior.`);
        };

        const junior = await this.juniorRepo.findOneBy({ id: details.juniorId });
        if (!junior) throw new BadRequestException(content.UserNotFound);

        const eeType = await this.extraEntryTypeRepo.findOneBy({ id: details.entryTypeId });
        if (!eeType) throw new BadRequestException(content.TypeNotFound);

        let message = content.ExtraEntryAdded;

        if (isPermit) {
            const newPermit = {junior: junior, permitType: eeType};
            this.permitRepo.save(newPermit);
        } else {
            const newExtraEntry = {junior: junior, extraEntryType: eeType};
            this.extraEntryRepo.save(newExtraEntry);
            const permitDeleted = await this.deletePermitIfAddedAsEntry(details.juniorId, details.entryTypeId, userId);
            if (permitDeleted) message += " - lisämerkintää vastaava lupa poistettu";
        }

        return message;
    };

    async deleteEntry(deletableId: number, userId?: string, isPermit?: boolean): Promise<string> {
        const entry = isPermit ?
            await this.permitRepo.createQueryBuilder('permit')
                .leftJoinAndSelect('permit.junior', 'junior')
                .where('permit.id = :id', { id: deletableId })
                .getOne() :
            await this.extraEntryRepo.createQueryBuilder('extraEntry')
                .leftJoinAndSelect('extraEntry.junior', 'junior')
                .where('extraEntry.id = :id', { id: deletableId })
                .getOne();

        if (!entry) throw new BadRequestException(content.ExtraEntryNotFound);
        const juniorId = entry?.junior?.id;

        if (userId && ConfigHelper.detailedLogs()) {
            this.logger.log({ userId: userId, juniorId: juniorId, entryId: deletableId }, `User deleted ${isPermit ? "permit" : "extra entry"} from junior.`);
        };

        if (isPermit) {
            const permit = await this.permitRepo.findOneBy({ id: deletableId });
            if (!permit) throw new BadRequestException(content.ExtraEntryNotFound);
            await this.permitRepo.remove(permit);
        } else {
            const extraEntry = await this.extraEntryRepo.findOneBy({ id: deletableId });
            if (!extraEntry) throw new BadRequestException(content.ExtraEntryNotFound);
            await this.extraEntryRepo.remove(extraEntry);
        }

        return content.ExtraEntryDeleted;
    };

    // Delete expired extra entries and permits, and clean up extra entry registry juniors every night at 4 AM
    @Cron('0 4 * * *')
    async cleanUpExtraEntryRegistry(): Promise<void> {
        this.logger.log("Cleaning up extra entry and permit registry.");
        const juniorEntries = (await this.getAllExtraEntries()).data;
        const expiredExtraEntries = [];
        const expiredPermits = [];

        for (let junior of juniorEntries) {
            for (let ee of junior.extraEntries) {
                if (junior.age >= ee.extraEntryType.expiryAge) {
                    expiredExtraEntries.push(ee.id);
                }
            }
            for (let p of junior.permits) {
                if (junior.age >= p.permitType.expiryAge) {
                    expiredPermits.push(p.id);
                }
            }
        }

        if (expiredExtraEntries.length > 0) {
            const deleted: DeleteResult = await this.extraEntryRepo.createQueryBuilder()
                .where('extra_entry.id IN (:...expiredIds)', { expiredIds: expiredExtraEntries })
                .delete()
                .execute();
            this.logger.log({ count: deleted.affected, ids: expiredExtraEntries }, "Deleted expired extra entries.");
        }

        if (expiredPermits.length > 0) {
            const deleted: DeleteResult = await this.permitRepo.createQueryBuilder()
                .where('permit.id IN (:...expiredIds)', { expiredIds: expiredPermits })
                .delete()
                .execute();
            this.logger.log({ count: deleted.affected, ids: expiredPermits }, "Deleted expired permits.");
        }

        await this.juniorService.cleanUpExtraEntryJuniors();
    }
};
