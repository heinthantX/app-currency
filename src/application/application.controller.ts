import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppGuard } from '../auth/guards/app-guard';
import { CurrentApp } from '../auth/decorators/current-app.decorator';
import { ApplicationService } from './application.service';
import { Application } from '@prisma/client';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('application')
@ApiBearerAuth()
@UseGuards(AppGuard)
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Get('')
  getApplication(@CurrentApp() application: Application) {
    return application;
  }
}
