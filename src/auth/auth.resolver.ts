import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { ApiCredentialOutput, SignInInput } from '../../typing';

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
    @Args('input') input: SignInInput,
  ): Promise<ApiCredentialOutput> {
    return this.authService.signUp(input);
  }
}
