import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from './common/common.module';
import { ApolloDriverConfig, ApolloDriver } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import {
  GraphQLDateTime,
  GraphQLObjectID,
  GraphQLJSON,
  PhoneNumberResolver,
} from 'graphql-scalars';
import { constraintDirective } from 'graphql-constraint-directive';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionFilter } from './common/filters/all-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CommonModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
      typePaths: ['./**/*.graphql'],
      resolvers: {
        DateTime: GraphQLDateTime,
        Json: GraphQLJSON,
        PhoneNumber: PhoneNumberResolver,
        ID: GraphQLObjectID,
      },
      introspection: true,
      transformSchema: constraintDirective(),
      parseOptions: {
        noLocation: true,
      },
    }),
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionFilter,
    },
  ],
})
export class AppModule {}
