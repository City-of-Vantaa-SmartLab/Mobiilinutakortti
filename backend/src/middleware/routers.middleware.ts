import { NestMiddleware, Injectable, HttpStatus } from '@nestjs/common';
import { join } from 'path';
import * as content from '../content';
import * as fs from 'fs';

@Injectable()
export class RoutersMiddleware implements NestMiddleware {
    use(req: any, res: any, next: () => void) {
        const baseUrl = req.baseUrl.toLowerCase();

        // Serve the environment config to read certain environment variables runtime.
        if (baseUrl === content.Routes.envConfig) {
            res.type("application/javascript");
            res.send(`window.__ENV_CONFIG__ = ${JSON.stringify({
                VITE_ENABLE_EXTRA_ENTRIES: process.env.VITE_ENABLE_EXTRA_ENTRIES,
                VITE_ENABLE_KOMPASSI_INTEGRATION: process.env.VITE_ENABLE_KOMPASSI_INTEGRATION,
                VITE_ENTRA_CLIENT_ID: process.env.VITE_ENTRA_CLIENT_ID,
                VITE_ENTRA_REDIRECT_URI: process.env.VITE_ENTRA_REDIRECT_URI,
                VITE_ENTRA_TENANT_ID: process.env.VITE_ENTRA_TENANT_ID,
                VITE_USE_ALT_ERR_MSG: process.env.VITE_USE_ALT_ERR_MSG
            })}`);
            return;
        } else if (baseUrl.includes(content.Routes.api)) {
            next();
        } else {
            const publicDirectory = baseUrl.includes(content.Routes.admin) ? 'public-admin' : 'public';
            // If backend is running just for API and for some reason another query comes, index.html is not found.
            if (fs.existsSync(`${publicDirectory}/index.html`)) {
                res.sendFile(join('index.html'), { root: publicDirectory });
            } else {
                res.status(HttpStatus.NOT_FOUND).send();
            }
        }
    }
}
