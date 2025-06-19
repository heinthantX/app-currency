import { GraphQLDefinitionsFactory } from '@nestjs/graphql';
import { SDLValidationContext } from 'graphql/validation/ValidationContext';
import { join } from 'path';

const definitionsFactory = new GraphQLDefinitionsFactory();
definitionsFactory.generate({
  typePaths: ['./src/**/*.graphql'],
  path: join(process.cwd(), 'typing/graphql.ts'),
  outputAs: 'class',
  enumsAsTypes: true,
  watch: process.env.NODE_ENV === 'development',
});
