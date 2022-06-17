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
        body.phoneNumber ? dataChanged = dataChanged || body.phoneNumber !== userToEdit.phoneNumber : body.phoneNumber = userToEdit.phoneNumber;
        body.firstName && body.firstName.trim() !== '' ? dataChanged = dataChanged || body.firstName !== userToEdit.firstName
            : body.firstName = userToEdit.firstName;
        body.lastName && body.lastName.trim() !== '' ? dataChanged = dataChanged || body.lastName !== userToEdit.lastName
            : body.lastName = userToEdit.lastName;
        body.postCode ? dataChanged = dataChanged || body.postCode !== userToEdit.postCode : body.lastName = userToEdit.lastName;
        body.parentsName ? dataChanged = dataChanged || body.parentsName !== userToEdit.parentsName : body.parentsName = userToEdit.parentsName;
        body.parentsPhoneNumber ? dataChanged = dataChanged || body.parentsPhoneNumber !== userToEdit.parentsPhoneNumber
            : body.parentsPhoneNumber = userToEdit.parentsPhoneNumber;
        body.birthday ? dataChanged = dataChanged || body.birthday !== userToEdit.birthday : body.birthday = userToEdit.birthday;
        body.homeYouthClub ? dataChanged = dataChanged || body.homeYouthClub !== userToEdit.homeYouthClub
            : body.homeYouthClub = userToEdit.homeYouthClub;
        body.gender ? dataChanged = dataChanged || body.gender !== userToEdit.gender : body.gender = userToEdit.gender;
        dataChanged = dataChanged || (body.nickName && body.nickName !== userToEdit.nickName);

        if (!dataChanged) { throw new BadRequestException(content.DataNotChanged); }
        return next.handle();
    }
}
