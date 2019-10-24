import { Module } from '@nestjs/common';
import { ClubService } from './club.service';

@Module({
  providers: [ClubService]
})
export class ClubModule {}
