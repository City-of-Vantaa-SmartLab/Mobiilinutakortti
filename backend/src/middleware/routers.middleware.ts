import { NestMiddleware, Injectable } from '@nestjs/common';
import { join } from 'path';
import * as content from '../content.json';

@Injectable()
export class RoutersMiddleware implements NestMiddleware {
    use(req: any, res: any, next: () => void) {
        // TODO: remove these logs once the missing index.html error is solved.
        try {
          console.log("Middleware DEBUG:");
          console.log("    - originalUrl: " + req.originalUrl);
          console.log("    - header.host: " + req.headers.host);
          console.log("    - header.ua: " + req.headers['user-agent']);
          console.log("    - remote IP: " + req.connection.remoteAddress);
        }
        catch {
          console.log("DEBUG: caught exception.");
        }

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
