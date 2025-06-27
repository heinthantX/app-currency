import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ApplicationService } from '../../application/application.service';

@Injectable()
export class AppGuard implements CanActivate {
  constructor(private readonly applicationService: ApplicationService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers?.['authorization']?.split(' ')?.[1];
    const application = await this.applicationService.verifyApiKey(apiKey);

    request.application = application;

    return true;
  }
}
