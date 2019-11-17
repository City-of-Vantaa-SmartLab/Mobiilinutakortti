import { NestMiddleware, Injectable } from '@nestjs/common';
import { join } from 'path';
import * as content from '../content.json';

@Injectable()
export class RoutersMiddleware implements NestMiddleware {
    use(req: any, res: any, next: () => void) {
        let { baseUrl } = req;
        baseUrl = baseUrl.toLowerCase();
        if (baseUrl.indexOf(content.Routes.api) === 1) {
            next();
        } else {
            const publicDirectory = baseUrl.indexOf(content.Routes.admin) === 1 ?
                'public-admin' : 'public';
            res.sendFile(join('index.html'), { root: publicDirectory });
        }
    }

}
