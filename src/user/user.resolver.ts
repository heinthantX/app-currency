import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UserService } from './user.service';
import { CurrentUser } from '../auth/decorators';
import * as prisma from '@prisma/client';
import { GqlAuthGuard } from '../auth/guards';
import { UseGuards } from '@nestjs/common';
import { UpdateUserInput, User } from '../../typing';

@Resolver('User')
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query('me')
  @UseGuards(GqlAuthGuard)
  me(@CurrentUser() user: prisma.User): User {
    return user;
  }

  @Mutation('updateUser')
  @UseGuards(GqlAuthGuard)
  async update(
    @CurrentUser() user: prisma.User,
    @Args('input')
    input: UpdateUserInput,
  ): Promise<User> {
    return this.userService.update(user.id, input);
  }
}
