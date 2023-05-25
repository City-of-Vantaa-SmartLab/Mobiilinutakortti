import { Injectable, NestInterceptor, ExecutionContext, CallHandler, BadRequestException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { YouthWorker } from '../entities';
import { Repository } from 'typeorm';
import { EditYouthWorkerDto } from '../dto';
import * as content from '../../content';

/**
 * An interceptor designed to provide accurate models when editting a youth worker.
 */
@Injectable()
export class YouthWorkerEditInterceptor implements NestInterceptor {

    /**
     * @param youthWorkerRepo - the youth worker repository.
     */
    constructor(
        @InjectRepository(YouthWorker)
        private readonly youthWorkerRepo: Repository<YouthWorker>) { }

    /**
     * A method to check the dto data found within the current context. Will error if no data has changed.
     *
     * @param context
     * @param next
     */
    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest();
        const body = request.body as EditYouthWorkerDto;
        const userToEdit = await this.youthWorkerRepo.findOneBy({ id: body.id });
        if (!userToEdit) { throw new BadRequestException(content.UserNotFound); }
        let dataChanged = false;
        body.email ? dataChanged = dataChanged || body.email.toLowerCase() !== userToEdit.email : body.email = userToEdit.email;
        body.firstName ? dataChanged = dataChanged || body.firstName !== userToEdit.firstName : body.firstName = userToEdit.firstName;
        body.lastName ? dataChanged = dataChanged || body.lastName !== userToEdit.lastName : body.lastName = userToEdit.lastName;
        dataChanged = dataChanged || body.mainYouthClub !== userToEdit.mainYouthClub;
        typeof body.isAdmin !== 'undefined' ? dataChanged = dataChanged || body.isAdmin !== userToEdit.isAdmin
            : body.isAdmin = userToEdit.isAdmin;
        if (!dataChanged) { throw new BadRequestException(content.DataNotChanged); }
        return next.handle();
    }
}
