import { Injectable, NestInterceptor, ExecutionContext, CallHandler, BadRequestException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from './../admin.entity';
import { Repository } from 'typeorm';
import { EditAdminDto } from '../dto';
import * as content from '../../content.json';

/**
 * An interceptor designed to provide accurate models when editting an admin.
 */
@Injectable()
export class AdminEditInterceptor implements NestInterceptor {

    /**
     * @param adminRepo - the Admin repository.
     */
    constructor(
        @InjectRepository(Admin)
        private readonly adminRepo: Repository<Admin>) { }

    /**
     * A method to check the dto data found within the current context. Will error if no data has changed.
     *
     * @param context
     * @param next
     */
    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest();
        const body = request.body as EditAdminDto;
        const userToEdit = await this.adminRepo.findOne(body.id);
        if (!userToEdit) { throw new BadRequestException(content.UserNotFound); }
        let dataChanged = false;
        body.email ? dataChanged = dataChanged || body.email.toLowerCase() !== userToEdit.email : body.email = userToEdit.email;
        body.firstName ? dataChanged = dataChanged || body.firstName !== userToEdit.firstName : body.firstName = userToEdit.firstName;
        body.lastName ? dataChanged = dataChanged || body.lastName !== userToEdit.lastName : body.lastName = userToEdit.lastName;
        typeof body.isSuperUser !== 'undefined' ? dataChanged = dataChanged || body.isSuperUser !== userToEdit.isSuperUser
            : body.isSuperUser = userToEdit.isSuperUser;
        if (!dataChanged) { throw new BadRequestException(content.DataNotChanged); }
        return next.handle();
    }
}
