import { Module } from '@nestjs/common';
import { SessionDBService } from './sessionDb.service';

@Module({
    imports: [],
    providers: [SessionDBService],
    exports: [SessionDBService],
})
export class SessionDBModule { }
