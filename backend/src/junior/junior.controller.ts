import { Controller, UsePipes, ValidationPipe, Post, Body } from '@nestjs/common';
import { JuniorService } from './junior.service';
import { LoginJuniorDto } from './dto';

@Controller('junior')
export class JuniorController {
    constructor(
        private readonly juniorService: JuniorService,
    ) { }

    @UsePipes(new ValidationPipe())
    @Post('login')
    async login(@Body() userData: LoginJuniorDto) {
        return this.juniorService.login(userData);
    }
}
