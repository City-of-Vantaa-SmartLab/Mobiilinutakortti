import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesGuard } from './roles.guard';
import { Junior } from '../junior/entities/junior.entity';
import { Admin } from '../admin/admin.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Admin, Junior]),
    ],
    providers: [RolesGuard],
    exports: [RolesGuard],
})
export class GuardsModule { }
