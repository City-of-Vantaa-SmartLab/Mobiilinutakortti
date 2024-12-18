import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { KompassiService } from './kompassi.service';

@Module({
    imports: [HttpModule],
    providers: [KompassiService],
    exports: [KompassiService]
})
export class KompassiModule { }
