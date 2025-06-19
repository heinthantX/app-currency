import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import {
  ApiCredentialOutput,
  SignInInput,
  SignUpInput,
  ChangePasswordInput,
  APIMessageOutput,
} from '../../typing';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from './guards/gql-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '@prisma/client';

@Resolver('Auth')
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation('signIn')
  async signIn(
    @Args('input') input: SignInInput,
  ): Promise<ApiCredentialOutput> {
    return this.authService.signIn(input);
  }

  @Mutation('signUp')
  async signUp(
    @Args('input') input: SignUpInput,
  ): Promise<ApiCredentialOutput> {
    return this.authService.signUp(input);
  }

  @Mutation('changePassword')
  @UseGuards(GqlAuthGuard)
  async changePassword(
    @Args('input') input: ChangePasswordInput,
    @CurrentUser() user: User,
  ): Promise<APIMessageOutput> {
    return this.authService.changePassword(input, user);
  }
}
