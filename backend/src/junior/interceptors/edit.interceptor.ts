import { Injectable, NestInterceptor, ExecutionContext, CallHandler, BadRequestException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Junior } from '../entities';
import { Repository } from 'typeorm';
import { EditJuniorDto } from '../dto/';
import * as content from '../../content';

@Injectable()
export class JuniorEditInterceptor implements NestInterceptor {
    constructor(
        @InjectRepository(Junior)
        private readonly juniorRepo: Repository<Junior>) { }

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest();
        const body = request.body as EditJuniorDto;
        const userToEdit = await this.juniorRepo.findOneBy({ id: body.id });
        if (!userToEdit) { throw new BadRequestException(content.UserNotFound); }
        let dataChanged = false;

        // Interceptor for non-nullable fields
        const nonNullableFields = ['phoneNumber', 'firstName', 'lastName', 'nickName', 'postCode', 'school', 'class', 'parentsName', 'parentsPhoneNumber', 'gender', 'communicationsLanguage', 'status', 'photoPermission', 'smsPermissionJunior', 'smsPermissionParent', 'emailPermissionParent'];
        dataChanged = nonNullableFields.some(field => {
            body[field] = body[field] ?? '';
            return body[field] !== userToEdit[field];
        });

        body.homeYouthClub = body.homeYouthClub === -1 ? body.homeYouthClub = null : body.homeYouthClub;

        // Interceptor for nullable fields
        const nullableFields = ['additionalContactInformation', 'parentsEmail', 'homeYouthClub'];
        dataChanged = dataChanged || nullableFields.some(field => {
            return body[field] !== userToEdit[field];
        });

        // Some dates include timestamp which makes it seem like birthday has changed even when it hasn't
        // ISO date(time) format begins with YYYY-MM-DD
        dataChanged ||= body.birthday?.substring(0, 10) !== userToEdit.birthday.substring(0, 10);

        if (!dataChanged) { throw new BadRequestException(content.DataNotChanged); }
        return next.handle();
    }
}
