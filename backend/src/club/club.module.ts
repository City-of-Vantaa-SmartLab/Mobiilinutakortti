import { Module } from '@nestjs/common';
import { ClubService } from './club.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Junior } from '../junior/entities';
import { Club, CheckIn } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([Junior, Club, CheckIn])],
  providers: [ClubService],
})
export class ClubModule { }
