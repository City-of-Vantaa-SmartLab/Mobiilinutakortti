import { Module } from '@nestjs/common';
import { SessionDBModule } from './sessionDb.module';
import { SessionGuard } from './session.guard';

@Module({
    imports: [SessionDBModule],
    providers: [SessionGuard],
    exports: [SessionGuard]
})
export class SessionModule { }
