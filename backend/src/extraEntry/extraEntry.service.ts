import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as content from '../content';
import { ExtraEntryType } from './entities';
import { ExtraEntryTypeViewModel } from './vm/extraEntryType.vm';
import { CreateExtraEntryTypeDto } from './dto/create.dto';
import { ConfigHelper } from 'src/configHandler';
import { Junior } from 'src/junior/entities';
import { getFilters } from 'src/utils/helpers';
import { ListControlDto } from 'src/common/dto';
import { ExtraEntryListViewModel } from './vm/extraEntryList.vm';
import { ExtraEntryViewModel } from './vm/extraEntry.vm';
import { JuniorService } from 'src/junior/junior.service';

@Injectable()
export class ExtraEntryService {
    private readonly logger = new Logger('Extra entry Service');

    constructor(
        @InjectRepository(ExtraEntryType)
        private readonly extraEntryTypeRepo: Repository<ExtraEntryType>,
        @InjectRepository(Junior)
        private readonly juniorRepo: Repository<Junior>,
        private readonly juniorService: JuniorService,
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
        const filters = getFilters(controls);
        let juniorEntities = await (this.juniorService.getAllJuniorsQuery(filters, true)).getMany();

        if (controls?.filters?.extraEntryType) {
            juniorEntities = juniorEntities.filter(j => j.extraEntries.find(ee => ee.extraEntryType.id === controls.filters.extraEntryType));
        }
        const juniors = juniorEntities.slice(filters.skip, filters.take).map(e => new ExtraEntryViewModel(e));

        if (userId && ConfigHelper.detailedLogs()) {
            this.logger.log({ userId: userId, juniorIds: juniors.map(junior => junior.id) }, `User fetched extra entries for juniors.`);
        }
        return new ExtraEntryListViewModel(juniors, juniorEntities.length);
    }
};

