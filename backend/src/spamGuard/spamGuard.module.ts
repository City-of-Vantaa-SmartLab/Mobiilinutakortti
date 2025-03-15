import { Module } from '@nestjs/common';
import { SpamGuardService } from './spamGuard.service';

@Module({
    imports: [],
    providers: [SpamGuardService],
    exports: [SpamGuardService]
})
export class SpamGuardModule { }
