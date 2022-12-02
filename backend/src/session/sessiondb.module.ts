import { Module } from '@nestjs/common';
import { SessionDBService } from './sessiondb.service';

@Module({
    imports: [],
    providers: [SessionDBService],
    exports: [SessionDBService],
})
export class SessionDBModule { }
