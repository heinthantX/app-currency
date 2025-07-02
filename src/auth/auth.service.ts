import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { TypedConfigService } from '../common/services';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import Cryptr from 'cryptr';
import bcrypt from 'bcrypt';
import {
  ApiCredentialOutput,
  SignInInput,
  SignUpInput,
  ChangePasswordInput,
  APIMessageOutput,
} from '../../typing';
import { User } from '@prisma/client';
import { JWTPayload, JWTPayloadData, JWTPayloadType } from './dto/jwt-payload';

@Injectable()
export class AuthService {
  private readonly cryptr: Cryptr;
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly configService: TypedConfigService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {
    this.cryptr = new Cryptr(this.configService.get('CRYPTR_SECRET'));
  }

  generateJWT(payload: string, secret?: string, expiresIn?: string): string {
    return this.jwtService.sign(
      { data: payload },
      { ...(expiresIn ? { expiresIn } : {}), secret },
    );
  }
  verifyJWT(token: string, secret?: string): JWTPayload {
    return this.jwtService.verify(token, { secret });
  }
  decodeJWT(token: string): JWTPayload {
    return this.jwtService.decode(token);
  }

  encrypt(payload: JWTPayloadData): string {
    return this.cryptr.encrypt(JSON.stringify(payload));
  }
  decrypt(payload: string): JWTPayloadData {
    return JSON.parse(this.cryptr.decrypt(payload)) as JWTPayloadData;
  }

  hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }
  comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async signIn({ email, password }: SignInInput): Promise<ApiCredentialOutput> {
    try {
      const user = await this.userService.findOne({
        email: email.toLocaleLowerCase(),
      });
      if (!user) {
        throw new BadRequestException('Wrong email or password');
      }
      const isMatch = await this.comparePassword(password, user.password);
      if (!isMatch) {
        throw new BadRequestException('Wrong email or password');
      }
      await this.userService.update(user.id, {
        lastLoginAt: new Date(),
      });
      return {
        access_token: this.generateJWT(
          this.encrypt({ id: user.id, type: JWTPayloadType.USER }),
        ),
      };
    } catch (err) {
      if (err instanceof BadRequestException) {
        throw err;
      }
      throw new BadRequestException('Unable to sign in');
    }
  }

  async signUp({
    email,
    password,
    companyName,
    contactPerson,
  }: SignUpInput): Promise<ApiCredentialOutput> {
    try {
      const user = await this.userService.findOne({
        email: email.toLocaleLowerCase(),
      });
      if (user) {
        throw new BadRequestException('Email already used');
      }

      const hashedPassword = await this.hashPassword(password);
      const newUser = await this.userService.create({
        email: email.toLocaleLowerCase(),
        password: hashedPassword,
        lastLoginAt: new Date(),
        companyName,
        contactPerson,
      });

      return {
        access_token: this.generateJWT(
          this.encrypt({ id: newUser.id, type: JWTPayloadType.USER }),
        ),
      };
    } catch (err) {
      if (err instanceof BadRequestException) {
        throw err;
      }
      throw new BadRequestException('Unable to sign in');
    }
  }

  async changePassword(
    input: ChangePasswordInput,
    user: User,
  ): Promise<APIMessageOutput> {
    const { oldPassword, newPassword } = input;
    const isMatch = await this.comparePassword(oldPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('Password is incorrect.');
    }

    const hashedPassword = await this.hashPassword(newPassword);
    await this.userService.update(user.id, { password: hashedPassword });
    return { message: 'Password changed successfully.' };
  }
}
