import { Injectable, NestInterceptor, ExecutionContext, CallHandler, BadRequestException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Junior } from '../entities/junior.entity';
import { Repository } from 'typeorm';
import { EditJuniorDto } from '../dto/index';
import * as content from '../../content.json';
import { Validator } from 'class-validator';

@Injectable()
export class JuniorEditInterceptor implements NestInterceptor {
    constructor(
        @InjectRepository(Junior)
        private readonly juniorRepo: Repository<Junior>) { }

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest();
        const body = request.body as EditJuniorDto;
        const userToEdit = await this.juniorRepo.findOne(body.id);
        if (!userToEdit) { throw new BadRequestException(content.UserNotFound); }
        let dataChanged = false;
        body.phoneNumber ? dataChanged = dataChanged || body.phoneNumber !== userToEdit.phoneNumber : body.phoneNumber = userToEdit.phoneNumber;
        body.firstName ? dataChanged = dataChanged || body.firstName !== userToEdit.firstName : body.firstName = userToEdit.firstName;
        body.lastName ? dataChanged = dataChanged || body.lastName !== userToEdit.lastName : body.lastName = userToEdit.lastName;
        // Additional check here as the ORM seems not to be checking this on update.
        if (!(new Validator()).isPhoneNumber(body.phoneNumber, 'FI')) { throw new BadRequestException(content.DataIncorrect); }
        if (!dataChanged) { throw new BadRequestException(content.DataNotChanged); }
        return next.handle();
    }
}
