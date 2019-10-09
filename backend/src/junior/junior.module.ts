import { Module } from '@nestjs/common';
import { JuniorService } from './junior.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Junior } from './junior.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Junior])],
  providers: [JuniorService],
  exports: [JuniorService],
})
export class JuniorModule { }
