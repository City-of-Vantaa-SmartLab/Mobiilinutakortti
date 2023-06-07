import { Module } from '@nestjs/common';
import { SessionDBModule } from './sessiondb.module';
import { SessionGuard } from './session.guard';
import { SessionDBService } from './sessiondb.service';

@Module({
    imports: [SessionDBModule],
    providers: [SessionGuard],
    exports: [SessionGuard]
})
export class SessionModule { }
