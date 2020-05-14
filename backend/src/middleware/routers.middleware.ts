import { NestMiddleware, Injectable } from '@nestjs/common';
import { join } from 'path';
import * as content from '../content.json';

@Injectable()
export class RoutersMiddleware implements NestMiddleware {
    use(req: any, res: any, next: () => void) {
        let { baseUrl } = req;
        baseUrl = baseUrl.toLowerCase();
        if (baseUrl.includes(content.Routes.api)) {
            next();
        } else {
            const publicDirectory = baseUrl.includes(content.Routes.admin) ?
                'public-admin' : 'public';
            res.sendFile(join('index.html'), { root: publicDirectory });
        }
    }
}
