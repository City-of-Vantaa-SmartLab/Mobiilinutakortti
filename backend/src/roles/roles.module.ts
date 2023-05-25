import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesGuard } from './roles.guard';
import { Junior } from '../junior/entities';
import { YouthWorker } from '../youthWorker/entities';

@Module({
    imports: [
        TypeOrmModule.forFeature([YouthWorker, Junior]),
    ],
    providers: [RolesGuard],
    exports: [RolesGuard],
})
export class RolesModule { }
