import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Repository, DeleteResult } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as content from '../content';
import { ExtraEntry } from './entities';
import { EntryType } from './entities';
import { EntryTypeViewModel } from './vm/entryType.vm';
import { CreateEntryTypeDto } from './dto/createType.dto';
import { CreateExtraEntryDto } from './dto/create.dto';
import { ConfigHandler } from '../configHandler';
import { Junior } from '../junior/entities';
import { getFilters } from '../common/helpers';
import { ListControlDto } from 'src/common/dto';
import { ExtraEntryListViewModel } from './vm/extraEntryList.vm';
import { JuniorExtraEntriesViewModel } from './vm/juniorExtraEntries.vm';
import { JuniorService } from '../junior/junior.service';
import { Cron } from '@nestjs/schedule';
import { EntryPermit } from './entities/entryPermit.entity';

@Injectable()
export class ExtraEntryService {
    private readonly logger = new Logger('Extra entry Service');

    constructor(
        @InjectRepository(EntryType)
        private readonly entryTypeRepo: Repository<EntryType>,
        @InjectRepository(ExtraEntry)
        private readonly extraEntryRepo: Repository<ExtraEntry>,
        @InjectRepository(EntryPermit)
        private readonly entryPermitRepo: Repository<EntryPermit>,
        @InjectRepository(Junior)
        private readonly juniorRepo: Repository<Junior>,
        private readonly juniorService: JuniorService,
        ) { }

    async getEntryType(id: number): Promise<EntryTypeViewModel> {
        return (await this.entryTypeRepo.findOneBy({ id }));
    };

    async getAllEntryTypes(): Promise<EntryTypeViewModel[]> {
        return (await this.entryTypeRepo.find()).map(entryType => new EntryTypeViewModel(entryType));
    };

    async createEntryType(entryTypeData: CreateEntryTypeDto): Promise<EntryTypeViewModel> {
        const entryType = {
            name: entryTypeData.name,
            expiryAge: entryTypeData.expiryAge,
        };
        const savedEntryType = await this.entryTypeRepo.save(entryType);
        return new EntryTypeViewModel(savedEntryType);
    };

    // Similar function can be made for juniors checkIns when needed: simply replace extraEntries with checkIns
    async getExtraEntriesForJunior(id: string): Promise<JuniorExtraEntriesViewModel> {
        const junior = await this.juniorRepo.createQueryBuilder('user')
            .leftJoinAndSelect('user.extraEntries', 'extraEntry')
            .leftJoinAndSelect('extraEntry.entryType', 'extraEntryType')
            .leftJoinAndSelect('user.entryPermits', 'entryPermit')
            .leftJoinAndSelect('entryPermit.entryType', 'entryPermitType')
            .where('user.id = :id', { id: id })
            .getOne();

        return new JuniorExtraEntriesViewModel(junior);
    }

    async getAllExtraEntries(controls?: ListControlDto): Promise<ExtraEntryListViewModel> {

        // Sorting and filtering of extra entries is easier done here than in database, therefore getFilters does not return the filters here. We filter manually below.
        // Note: normally the filters are of AND type, but here they are OR type as otherwise it wouldn't make any sense.

        const sortField = controls?.sort?.field;
        const filters = getFilters(controls);
        let juniorEntities = await (this.juniorService.getAllJuniorsQuery(filters, true)).getMany();

        const extraEntryType = controls?.filters?.extraEntryType;
        const entryPermitType = controls?.filters?.entryPermitType;

        const juniorsWithEEs = extraEntryType ? juniorEntities.filter(j => {
            if (extraEntryType === -1) { // no extra entries
                return Array.isArray(j.extraEntries) && j.extraEntries.length === 0;
            } else if (extraEntryType === -2) { // any extra entry
                return Array.isArray(j.extraEntries) && j.extraEntries.length > 0;
            } else {
                return j.extraEntries?.find(ee => ee.entryType.id === extraEntryType);
            }
        }) : [];

        const juniorsWithEPs = entryPermitType !== undefined ? juniorEntities.filter(j => {
            if (entryPermitType === -1) { // no entry permits
                return Array.isArray(j.entryPermits) && j.entryPermits.length === 0;
            } else if (entryPermitType === -2) { // any entry permit
                return Array.isArray(j.entryPermits) && j.entryPermits.length > 0;
            } else {
                return j.entryPermits?.find(ep => ep.entryType.id === entryPermitType);
            }
        }) : [];

        const combined = [...juniorsWithEEs, ...juniorsWithEPs];
        const idsUnion = Array.from(new Set(combined.map(j => j.id)));

        if (extraEntryType || entryPermitType) juniorEntities = juniorEntities.filter(j => idsUnion.includes(j.id));

        if (sortField === "extraEntries" || sortField === "entryPermits") {
            if (controls?.sort?.order === "DESC") juniorEntities = juniorEntities.sort((a,b) => a[sortField].length - b[sortField].length);
            if (controls?.sort?.order === "ASC") juniorEntities = juniorEntities.sort((a,b) => b[sortField].length - a[sortField].length);
        }

        const juniors = (controls ? juniorEntities.slice(filters.skip, filters.skip + filters.take) : juniorEntities).map(e => new JuniorExtraEntriesViewModel(e));

        return new ExtraEntryListViewModel(juniors, juniorEntities.length);
    }

    async deletePermitIfAddedAsEntry(juniorId: string, deletableType: number, userId?: string): Promise<boolean> {
        const juniorWithPermits = await this.getExtraEntriesForJunior(juniorId);
        const deletablePermit = juniorWithPermits.entryPermits.find((permit) => {
            return permit.entryType.id === deletableType;
        });
        if (deletablePermit) {
            this.deleteEntry(deletablePermit.id, userId, true);
            return true;
        } else {
            return false;
        }
    };

    async createEntry(details: CreateExtraEntryDto, userId?: string): Promise<{ id: number, message: string }> {
        const isPermit = details.isPermit;

        if (userId && ConfigHandler.detailedLogs()) {
            this.logger.log({ userId: userId, juniorId: details.juniorId, entryTypeId: details.entryTypeId }, `User created an ${isPermit ? "entry permit" : "extra entry"} for junior.`);
        };

        const junior = await this.juniorRepo.findOneBy({ id: details.juniorId });
        if (!junior) throw new BadRequestException(content.UserNotFound);

        const eeType = await this.entryTypeRepo.findOneBy({ id: details.entryTypeId });
        if (!eeType) throw new BadRequestException(content.TypeNotFound);

        let message = content.ExtraEntryAdded;
        let savedEntity;

        if (isPermit) {
            const newPermit = {junior: junior, entryType: eeType};
            savedEntity = await this.entryPermitRepo.save(newPermit);
        } else {
            const newExtraEntry = {junior: junior, entryType: eeType};
            savedEntity = await this.extraEntryRepo.save(newExtraEntry);
            const permitDeleted = await this.deletePermitIfAddedAsEntry(details.juniorId, details.entryTypeId, userId);
            if (permitDeleted) message += " - lisämerkintää vastaava lupa poistettu";
        }

        return { id: savedEntity.id, message };
    };

    async deleteEntry(deletableId: number, userId?: string, isPermit?: boolean): Promise<string> {
        const entry = isPermit ?
            await this.entryPermitRepo.createQueryBuilder('permit')
                .leftJoinAndSelect('permit.junior', 'junior')
                .where('permit.id = :id', { id: deletableId })
                .getOne() :
            await this.extraEntryRepo.createQueryBuilder('extraEntry')
                .leftJoinAndSelect('extraEntry.junior', 'junior')
                .where('extraEntry.id = :id', { id: deletableId })
                .getOne();

        if (!entry) throw new BadRequestException(content.ExtraEntryNotFound);
        const juniorId = entry?.junior?.id;

        if (userId && ConfigHandler.detailedLogs()) {
            this.logger.log({ userId: userId, juniorId: juniorId, entryId: deletableId }, `User deleted ${isPermit ? "permit" : "extra entry"} from junior.`);
        };

        if (isPermit) {
            const permit = await this.entryPermitRepo.findOneBy({ id: deletableId });
            if (!permit) throw new BadRequestException(content.ExtraEntryNotFound);
            await this.entryPermitRepo.remove(permit);
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
        const expiredEntryPermits = [];

        for (const junior of juniorEntries) {
            for (const ee of junior.extraEntries) {
                if (junior.age >= ee.entryType.expiryAge) {
                    expiredExtraEntries.push(ee.id);
                }
            }
            for (const p of junior.entryPermits) {
                if (junior.age >= p.entryType.expiryAge) {
                    expiredEntryPermits.push(p.id);
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

        if (expiredEntryPermits.length > 0) {
            const deleted: DeleteResult = await this.entryPermitRepo.createQueryBuilder()
                .where('entry_permit.id IN (:...expiredIds)', { expiredIds: expiredEntryPermits })
                .delete()
                .execute();
            this.logger.log({ count: deleted.affected, ids: expiredEntryPermits }, "Deleted expired entry permits.");
        }

        await this.juniorService.cleanUpExtraEntryJuniors();
    }
};
