import { Catch, ArgumentsHost, Logger, ContextType } from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';
import { Response } from 'express';
import { GraphQLError } from 'graphql/error';

@Catch()
export class AllExceptionFilter implements GqlExceptionFilter {
  private readonly logger = new Logger(AllExceptionFilter.name);

  catch(exception: Error, host: ArgumentsHost) {
    const status = (exception?.['status'] as number) || 500;
    const response = exception?.['response'] as Response;
    const tempMessage = response?.['message'] as string | string[] | undefined;
    const message = Array.isArray(tempMessage)
      ? tempMessage
      : typeof tempMessage === 'string'
        ? [tempMessage]
        : ['Internal Server Error'];

    if (status === 500) {
      this.logger.error(exception, exception.stack);
    }
    const errorResponse = {
      timestamp: new Date().toISOString(),
      statusCode: status,
      message,
      error: (response?.['error'] || exception.name) as string,
    };
    if (host.getType() === ('graphql' as ContextType)) {
      return new (class extends GraphQLError {
        constructor() {
          super(message.join(', '), {
            extensions: errorResponse,
          });
        }

        response = {
          statusCode: status,
        };
        status = status === 500 ? undefined : status;
      })();
    } else if (host.getType() === ('http' as ContextType)) {
      return host
        .switchToHttp()
        .getResponse<Response>()
        .status(status)
        .json(errorResponse);
    }
  }
}
