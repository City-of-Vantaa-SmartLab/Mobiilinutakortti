import { NestMiddleware, Injectable, HttpStatus } from '@nestjs/common';
import { join } from 'path';
import * as content from '../content';
import * as fs from 'fs';

@Injectable()
export class RoutersMiddleware implements NestMiddleware {
    use(req: any, res: any, next: () => void) {
        // NOTE: If each application (backend, frontend, admin-frontend) are run on separate containers
        // (for example, in Amazon Elastic Container Service), the index.html is not found.
        // A missing index.html would result in an error message to logs. There are port scanners and such running
        // all around the Internet, and so the logs would be flooded with errors.
        // In a such configuration the backend is only expected to receive API calls.
        //
        // However, if running the apps in Elastic Beanstalk, the index.html does exist and this middleware
        // actually decides which application to serve (frontend or admin-frontend), if the request is not an API call.
        // Therefore, we check if the index.html exist before serving it.
        let { baseUrl } = req;
        baseUrl = baseUrl.toLowerCase();
        if (baseUrl.includes(content.Routes.api)) {
            next();
        } else {
            const publicDirectory = baseUrl.includes(content.Routes.admin) ? 'public-admin' : 'public';
            if (fs.existsSync(`${publicDirectory}/index.html`)) {
                res.sendFile(join('index.html'), { root: publicDirectory });
            } else {
                res.status(HttpStatus.NOT_FOUND).send();
            }
        }
    }
}
