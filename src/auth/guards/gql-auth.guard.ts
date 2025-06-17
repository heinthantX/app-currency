import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { IS_OPTIONAL_KEY, IS_PUBLIC_KEY } from '../decorators';
import { User, UserRole } from '@prisma/client';
import { ROLES_KEY } from '../decorators';

@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  getRequest<T = any>(context: ExecutionContext): T {
    return GqlExecutionContext.create(context).getContext<{ req: T }>().req;
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }

  handleRequest<TUser extends User>(
    err,
    user: TUser,
    info,
    context: ExecutionContext,
  ): TUser {
    const isOptionalAuth = this.reflector.getAllAndOverride<boolean>(
      IS_OPTIONAL_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (isOptionalAuth) {
      return user;
    }
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid credential.');
    }
    const roles = this.reflector.getAllAndOverride<{
      allowed: UserRole[];
      notAllowed: UserRole[];
    }>(ROLES_KEY, [context.getHandler(), context.getClass()]);
    if (
      (roles?.notAllowed && roles.notAllowed.includes(user.role)) ||
      (roles?.allowed?.length && !roles.allowed.includes(user.role))
    ) {
      throw new ForbiddenException(`You don't have access to this resource.`);
    }
    return user;
  }
}
