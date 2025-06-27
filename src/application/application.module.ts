import { Module } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { ApplicationResolver } from './application.resolver';
import { AuthModule } from '../auth/auth.module';
import { ApplicationController } from './application.controller';

@Module({
  imports: [AuthModule],
  providers: [ApplicationResolver, ApplicationService],
  controllers: [ApplicationController],
})
export class ApplicationModule {}
