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
        const bodyRecord = body as unknown as Record<string, unknown>;
        const userRecord = userToEdit as unknown as Record<string, unknown>;

        // Interceptor for non-nullable fields
        const stringFields: Array<keyof EditJuniorDto> = ['phoneNumber', 'firstName', 'lastName', 'nickName', 'postCode', 'school', 'class', 'parentsName', 'parentsPhoneNumber', 'gender', 'communicationsLanguage', 'status'];
        stringFields.forEach(field => {
            bodyRecord[field as string] = bodyRecord[field as string] ?? '';
        });

        const nonNullableFields: Array<keyof EditJuniorDto> = ['phoneNumber', 'firstName', 'lastName', 'nickName', 'postCode', 'school', 'class', 'parentsName', 'parentsPhoneNumber', 'gender', 'communicationsLanguage', 'status', 'photoPermission', 'smsPermissionJunior', 'smsPermissionParent', 'emailPermissionParent'];
        dataChanged = nonNullableFields.some(field => {
            return bodyRecord[field as string] !== userRecord[field as string];
        });

        body.homeYouthClub = body.homeYouthClub === -1 ? null : body.homeYouthClub;

        // Interceptor for nullable fields
        const nullableFields: Array<keyof EditJuniorDto> = ['additionalContactInformation', 'parentsEmail', 'homeYouthClub'];
        dataChanged = dataChanged || nullableFields.some(field => {
            return bodyRecord[field as string] !== userRecord[field as string];
        });

        // Some dates include timestamp which makes it seem like birthday has changed even when it hasn't
        // ISO date(time) format begins with YYYY-MM-DD
        dataChanged ||= body.birthday?.substring(0, 10) !== userToEdit.birthday.substring(0, 10);

        if (!dataChanged) { throw new BadRequestException(content.DataNotChanged); }
        return next.handle();
    }
}
