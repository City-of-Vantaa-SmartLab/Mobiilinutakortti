import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as content from '../content';
import { ExtraEntryType } from './entities';
import { ExtraEntryTypeViewModel } from './vm/extraEntryType.vm';
import { CreateExtraEntryTypeDto } from './dto/create.dto';
import { ConfigHelper } from 'src/configHandler';
import { Junior } from 'src/junior/entities';

@Injectable()
export class ExtraEntryService {
    private readonly logger = new Logger('Extra entry Service');

    constructor(
        @InjectRepository(ExtraEntryType)
        private readonly extraEntryTypeRepo: Repository<ExtraEntryType>,
        @InjectRepository(Junior)
        private readonly juniorRepo: Repository<Junior>,
        ) { }

    async getAllExtraTypes(): Promise<any> {
        return (await this.extraEntryTypeRepo.find()).map(extraEntryType => new ExtraEntryTypeViewModel(extraEntryType));
    };

    async createExtraEntry(extraEntryData: CreateExtraEntryTypeDto){
        const extraEntryType = {
            title: extraEntryData.title,
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
};
