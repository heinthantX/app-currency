import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../../user/user.service';
import { AuthService } from '../auth.service';
import { TypedConfigService } from '../../common/services';
import { JWTPayload } from '../dto/jwt-payload';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: TypedConfigService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JWTPayload) {
    const id = this.authService.decrypt(payload.data)?.id;
    const user = id && (await this.userService.findOne({ id }));
    if (!user) throw new UnauthorizedException('Invalid credential.');
    return user;
  }
}
