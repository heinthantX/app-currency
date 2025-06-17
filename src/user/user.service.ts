import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/services';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  create(user: Prisma.UserCreateInput) {
    return this.prismaService.user.create({
      data: user,
    });
  }

  update(id: string, user: Prisma.UserUpdateInput) {
    return this.prismaService.user.update({
      where: { id },
      data: user,
    });
  }

  findOne(where: Prisma.UserWhereInput | string) {
    return this.prismaService.user.findFirst({
      where: typeof where === 'string' ? { id: where } : where,
    });
  }
}
