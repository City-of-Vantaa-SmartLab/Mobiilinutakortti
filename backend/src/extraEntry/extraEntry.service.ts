import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as content from '../content';
import { ExtraEntryType } from './entities';
import { ExtraEntryTypeViewModel } from './vm/extraEntryType.vm';
import { CreateExtraEntryTypeDto } from './dto/create.dto';
import { ConfigHelper } from 'src/configHandler';
import { Junior } from 'src/junior/entities';
import { applyFilters, applySort } from 'src/utils/helpers';
import { ListControlDto } from 'src/common/dto';
import { ExtraEntryListViewModel } from './vm/extraEntryList.vm';
import { ExtraEntryViewModel } from './vm/extraEntry.vm';

@Injectable()
export class ExtraEntryService {
    private readonly logger = new Logger('Extra entry Service');

    constructor(
        @InjectRepository(ExtraEntryType)
        private readonly extraEntryTypeRepo: Repository<ExtraEntryType>,
        @InjectRepository(Junior)
        private readonly juniorRepo: Repository<Junior>,
        ) { }

    async createExtraEntry(extraEntryData: CreateExtraEntryTypeDto){
        const extraEntryType = {
            name: extraEntryData.name,
            expiryAge: extraEntryData.expiryAge,
        }
        await this.extraEntryTypeRepo.save(extraEntryType);
        return content.ExtraEntryTypeSaved;
    };

    async getExtraEntryType(id: number): Promise<ExtraEntryTypeViewModel> {
        return (await this.extraEntryTypeRepo.findOneBy({ id }));
    };

    async getAllExtraEntryTypes(): Promise<any> {
        return (await this.extraEntryTypeRepo.find()).map(extraEntryType => new ExtraEntryTypeViewModel(extraEntryType));
    };

    async createExtraEntryType(extraEntryData: CreateExtraEntryTypeDto){
        const extraEntryType = {
            name: extraEntryData.name,
            expiryAge: extraEntryData.expiryAge,
        }
        await this.extraEntryTypeRepo.save(extraEntryType);
        return content.ExtraEntryTypeSaved;
    };

    // Similar function can be made for juniors checkIns when needed: simply replace extraEntries with checkIns
    async getExtraEntriesForJunior(id: string, userId?: string): Promise<Junior> {
        if (userId && ConfigHelper.detailedLogs()) {
            this.logger.log({ userId: userId, juniorId: id }, `User fetched extra entries for junior.`);
        }

        return await this.juniorRepo.findOne({ where: {id}, relations: ['extraEntries'] } );
    }

    async getAllExtraEntries(controls?: ListControlDto, userId?: string): Promise<ExtraEntryListViewModel> {
        let order = {}, filterValues = {}, query = '', take = 0, skip = 0;
        if (controls) {
            order = controls.sort ? applySort(controls.sort) : {};
            ({ query, filterValues } = controls.filters ? applyFilters(controls.filters) : { query: '', filterValues: [] });
            take = controls.pagination ? controls.pagination.perPage : 0;
            skip = controls.pagination ? controls.pagination.perPage * (controls.pagination.page - 1) : 0;
        }
        const total = await this.juniorRepo.createQueryBuilder('user')
            .innerJoinAndSelect('user.extraEntries', 'extraEntries')
            .where(query ? query : '1=1', filterValues)
            .andWhere('user.extraEntries IS NOT NULL')
            .getCount()

        const response = (await this.juniorRepo.createQueryBuilder('user')
            .innerJoinAndSelect('user.extraEntries', 'extraEntries')
            .where(query ? query : '1=1', filterValues)
            .andWhere('user.extraEntries IS NOT NULL')
            .orderBy(order)
            .take(take)
            .skip(skip)
            .getMany())
            .map(e => new ExtraEntryViewModel(e));

        if (userId && ConfigHelper.detailedLogs()) {
            this.logger.log({ userId: userId, juniorIds: response.map(junior => junior.id) }, `User fetched juniors.`);
        }
        return new ExtraEntryListViewModel(response, total);
    }
};
