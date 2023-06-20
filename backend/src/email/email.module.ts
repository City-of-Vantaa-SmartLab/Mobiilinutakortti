import { Module, HttpModule } from '@nestjs/common';
import { EmailService } from './email.service';

@Module({
  imports: [
    HttpModule
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule { }
