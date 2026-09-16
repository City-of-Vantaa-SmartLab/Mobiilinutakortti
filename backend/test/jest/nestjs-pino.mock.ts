import { DynamicModule, Module } from '@nestjs/common'

@Module({})
export class LoggerModule {
    static forRoot(): DynamicModule {
        return {
            module: LoggerModule,
        }
    }
}

export class Logger {
    trace(): void {}
    debug(): void {}
    info(): void {}
    warn(): void {}
    error(): void {}
    fatal(): void {}
}