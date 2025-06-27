import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../common/services';
import * as prisma from '@prisma/client';
import {
  Application,
  CreateApplicationInput,
  UpdateApplicationInput,
  InviteUserInput,
  FindAllInput,
  FindAllApplicationOutput,
  APIMessageOutput,
} from '../../typing';
import { generateApiSecret, removeNullishKeys } from '../common/util';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class ApplicationService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly authService: AuthService,
  ) {}

  getQuery(
    user: prisma.User,
    id?: string,
  ): prisma.Prisma.ApplicationWhereUniqueInput {
    return {
      userIds: {
        has: user.id,
      },
      id,
    };
  }

  async findAll(
    dto: FindAllInput,
    user: prisma.User,
  ): Promise<FindAllApplicationOutput> {
    const where: prisma.Prisma.ApplicationWhereInput = this.getQuery(user);
    const [applications, total] = await Promise.all([
      this.prismaService.application.findManyPaginated({ where }, dto),
      this.prismaService.application.count({
        where,
      }),
    ]);
    return { data: applications, total };
  }

  async findById(id: string, user: prisma.User): Promise<Application> {
    return this.prismaService.application.findFirstOrThrow({
      where: this.getQuery(user, id),
    });
  }

  async create(
    dto: CreateApplicationInput,
    user: prisma.User,
  ): Promise<Application> {
    const secret = generateApiSecret();
    return this.prismaService.application.create({
      data: {
        ...dto,
        userIds: [user.id],
        status: 'ACTIVE',
        secretKey: secret,
      },
    });
  }

  async update(
    { id, ...dto }: UpdateApplicationInput,
    user: prisma.User,
  ): Promise<Application> {
    removeNullishKeys(dto);
    return this.prismaService.application.updateOrThrow({
      where: this.getQuery(user, id),
      data: {
        ...dto,
      },
    });
  }

  async delete(id: string, user: prisma.User): Promise<Application> {
    return this.prismaService.application.deleteOrThrow({
      where: this.getQuery(user, id),
    });
  }

  async inviteUser(
    dto: InviteUserInput,
    user: prisma.User,
  ): Promise<Application> {
    const existingApp = await this.findById(dto.applicationId, user);

    return this.prismaService.application.update({
      where: { id: dto.applicationId },
      data: {
        userIds: Array.from(new Set([...existingApp.userIds, dto.userId])),
      },
    });
  }

  async getApiKey(applicationId: string, user: prisma.User): Promise<string> {
    const application = await this.prismaService.application.findFirstOrThrow({
      where: this.getQuery(user, applicationId),
      select: {
        id: true,
        secretKey: true,
      },
    });

    return this.authService.generateJWT(
      this.authService.encrypt({ applicationId: application.id }),
      application.secretKey,
    );
  }

  async refreshApiKey(
    applicationId: string,
    user: prisma.User,
  ): Promise<APIMessageOutput> {
    const secret = generateApiSecret();
    await this.prismaService.application.updateOrThrow({
      where: this.getQuery(user, applicationId),
      data: { secretKey: secret },
    });
    return {
      message: 'API key refreshed successfully',
    };
  }

  async verifyApiKey(token: string) {
    if (!token) {
      throw new UnauthorizedException('No API key provided');
    }
    try {
      const applicationId = this.authService.decrypt(
        this.authService.decodeJWT(token)?.['data'],
      )?.['applicationId'];
      if (!applicationId) {
        throw new UnauthorizedException('Invalid API key');
      }
      const application = await this.prismaService.application.findFirstOrThrow(
        {
          where: { id: applicationId },
        },
      );
      this.authService.verifyJWT(token, application.secretKey);
      delete application.secretKey;
      return application;
    } catch (error) {
      throw new UnauthorizedException('Invalid API key');
    }
  }
}
