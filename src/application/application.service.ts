import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/services';
import * as prisma from '@prisma/client';
import {
  Application,
  CreateApplicationInput,
  UpdateApplicationInput,
  InviteUserInput,
  FindAllInput,
  FindAllApplicationOutput,
} from '../../typing';
import { removeNullishKeys } from '../common/util';

@Injectable()
export class ApplicationService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(
    dto: FindAllInput,
    user: prisma.User,
  ): Promise<FindAllApplicationOutput> {
    const where: prisma.Prisma.ApplicationWhereInput = {
      userIds: {
        has: user.id,
      },
    };
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
      where: {
        id,
        userIds: {
          has: user.id,
        },
      },
    });
  }

  async create(
    dto: CreateApplicationInput,
    user: prisma.User,
  ): Promise<Application> {
    return this.prismaService.application.create({
      data: {
        ...dto,
        userIds: [user.id],
        status: 'ACTIVE',
      },
    });
  }

  async update(
    { id, ...dto }: UpdateApplicationInput,
    user: prisma.User,
  ): Promise<Application> {
    removeNullishKeys(dto);
    return this.prismaService.application.updateOrThrow({
      where: { id, userIds: { has: user.id } },
      data: {
        ...dto,
      },
    });
  }

  async delete(id: string, user: prisma.User): Promise<Application> {
    return this.prismaService.application.deleteOrThrow({
      where: { id, userIds: { has: user.id } },
    });
  }

  async inviteUser(
    inviteUserInput: InviteUserInput,
    user: prisma.User,
  ): Promise<Application> {
    const existingApp = await this.findById(
      inviteUserInput.applicationId,
      user,
    );

    return this.prismaService.application.update({
      where: { id: inviteUserInput.applicationId },
      data: {
        userIds: Array.from(
          new Set([...existingApp.userIds, inviteUserInput.userId]),
        ),
      },
    });
  }
}
