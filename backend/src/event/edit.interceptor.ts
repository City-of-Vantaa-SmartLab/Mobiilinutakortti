import { Injectable, NestInterceptor, ExecutionContext, CallHandler, BadRequestException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Event } from './event.entity';
import { Repository } from 'typeorm';
import { EditEventDto } from './edit.dto';
import * as content from '../content';

@Injectable()
export class EventEditInterceptor implements NestInterceptor {
    constructor(
        @InjectRepository(Event)
        private readonly eventRepo: Repository<Event>) { }

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest();
        const body = request.body as EditEventDto;
        const eventToEdit = await this.eventRepo.findOne({
            where: { id: body.id },
            relations: ['permit']
        });
        if (!eventToEdit) { throw new BadRequestException(content.EventNotFound); };

        let dataChanged = false;
        dataChanged = body.name !== eventToEdit.name;
        dataChanged ||= body.description !== eventToEdit.description;

        const bodyDate = body.startDate ? new Date(body.startDate).getTime() : null;
        const eventDate = eventToEdit.startDate ? new Date(eventToEdit.startDate).getTime() : null;
        dataChanged ||= bodyDate !== eventDate;

        dataChanged ||= body.integrationId !== eventToEdit.integrationId;

        dataChanged ||= body.needsPermit !== !!eventToEdit.permit;

        if (!dataChanged) { throw new BadRequestException(content.DataNotChanged); };
        return next.handle();
    }
}
