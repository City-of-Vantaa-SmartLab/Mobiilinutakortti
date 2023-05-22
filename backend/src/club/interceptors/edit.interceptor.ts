import { Injectable, NestInterceptor, ExecutionContext, CallHandler, BadRequestException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Club } from '../entities';
import { Repository } from 'typeorm';
import { EditClubDto } from '../dto/edit.dto';
import * as content from '../../content';

@Injectable()
export class ClubEditInterceptor implements NestInterceptor {
    constructor(
        @InjectRepository(Club)
        private readonly clubRepo: Repository<Club>) { }

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest();
        const body = request.body as EditClubDto;
        const clubToEdit = await this.clubRepo.findOneBy({ id: body.id });
        if (!clubToEdit) { throw new BadRequestException(content.ClubNotFound); };

        let dataChanged = false;
        dataChanged = body.active !== clubToEdit.active;

        // Interceptor for messages with languages
        const messageLanguages = ['fi', 'en', 'sv'];
        dataChanged = messageLanguages.some(language => {
            return body.messages[language] !== clubToEdit.messages[language];
        })

        if (!dataChanged) { throw new BadRequestException(content.DataNotChanged); };
        return next.handle();
    }
}
