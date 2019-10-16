import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesGuard } from './roles.guard';
import { Junior } from '../junior/entities';
import { Admin } from '../admin/admin.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Admin, Junior]),
    ],
    providers: [RolesGuard],
    exports: [RolesGuard],
})
export class GuardsModule { }
