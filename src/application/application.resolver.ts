import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { ApplicationService } from './application.service';
import {
  Application,
  CreateApplicationInput,
  UpdateApplicationInput,
  InviteUserInput,
  FindAllInput,
  FindAllApplicationOutput,
} from '../../typing';
import { CurrentUser } from '../auth/decorators';
import * as prisma from '@prisma/client';

@Resolver('Application')
export class ApplicationResolver {
  constructor(private readonly applicationService: ApplicationService) {}

  @Query('applications')
  async applications(
    @Args('findAllInput') findAllInput: FindAllInput,
    @CurrentUser() user: prisma.User,
  ): Promise<FindAllApplicationOutput> {
    return this.applicationService.findAll(findAllInput, user);
  }

  @Query('application')
  async application(
    @Args('id') id: string,
    @CurrentUser() user: prisma.User,
  ): Promise<Application> {
    return this.applicationService.findById(id, user);
  }

  @Mutation('createApplication')
  async createApplication(
    @Args('createApplicationInput')
    createApplicationInput: CreateApplicationInput,
    @CurrentUser() user: prisma.User,
  ): Promise<Application> {
    return this.applicationService.create(createApplicationInput, user);
  }

  @Mutation('updateApplication')
  async updateApplication(
    @Args('updateApplicationInput')
    updateApplicationInput: UpdateApplicationInput,
    @CurrentUser() user: prisma.User,
  ): Promise<Application> {
    return this.applicationService.update(updateApplicationInput, user);
  }

  @Mutation('deleteApplication')
  async deleteApplication(
    @Args('id') id: string,
    @CurrentUser() user: prisma.User,
  ): Promise<Application> {
    return this.applicationService.delete(id, user);
  }

  @Mutation('inviteUserToApplication')
  async inviteUserToApplication(
    @Args('inviteUserInput') inviteUserInput: InviteUserInput,
    @CurrentUser() user: prisma.User,
  ): Promise<Application> {
    return this.applicationService.inviteUser(inviteUserInput, user);
  }
}
