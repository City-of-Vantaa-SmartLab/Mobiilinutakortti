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
                VITE_API_URL: process.env.VITE_API_URL,
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
            // If each part of the application (backend, frontend, admin-frontend) are run in separate containers
            // the index.html is not found. A missing index.html might result in an error messages spamming the logs.
            // In such a special configuration the backend is only expected to receive API calls.
            if (fs.existsSync(`${publicDirectory}/index.html`)) {
                res.sendFile(join('index.html'), { root: publicDirectory });
            } else {
                res.status(HttpStatus.NOT_FOUND).send();
            }
        }
    }
}
