import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ApplicationService } from '../../application/application.service';
import { Request } from 'express';

@Injectable()
export class AppGuard implements CanActivate {
  constructor(private readonly applicationService: ApplicationService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers?.['authorization']?.split(' ')?.[1];
    const application = await this.applicationService.verifyApiKey(apiKey);

    request['application'] = application;

    return true;
  }
}
