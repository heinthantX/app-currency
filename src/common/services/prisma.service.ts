/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  BadRequestException,
  HttpException,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

const PRISMA_ERROR = {
  NOT_FOUND_ERR: 'P2025',
  UNIQUE_CONSTRAINT_ERR: 'P2002',
  QUERY_INTERPRETATION_ERR: 'P2016',
};

interface IFormattedError {
  /** Custom exception to throw if the record is not found. */
  notFoundException?: HttpException;
  /** Custom message for relation errors, use '*' as a placeholder for the relation name. */
  relationErrorMessage?: string;
}

/**
 * Wraps a Prisma query to handle not found errors.
 * @param prismaQuery - The Prisma query to execute.
 * @param formattedError - Optional error formatting options.
 * @returns The result of the Prisma query.
 * @throws HttpException - Throws a custom or default BadRequestException if the record is not found.
 */
export async function prismaNotFoundErrorWrapper<I>(
  prismaQuery: Promise<I>,
  formattedError?: IFormattedError,
): Promise<I> {
  const httpException =
    formattedError?.notFoundException ||
    new BadRequestException('Record Not Found');
  try {
    const result = await prismaQuery;
    if (!result) {
      throw httpException;
    }
    return result;
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === PRISMA_ERROR.NOT_FOUND_ERR) {
        const relationError = (err.meta?.cause as string)?.match(
          /^No '(\w+)' record\(s\) \(needed to inline the relation on/,
        )?.[1];
        if (relationError) {
          throw new BadRequestException(
            formattedError?.relationErrorMessage
              ? formattedError.relationErrorMessage.replaceAll(
                  '*',
                  relationError,
                )
              : `${relationError} Not Found`,
          );
        }
        throw httpException;
      }
      if (err.code === PRISMA_ERROR.UNIQUE_CONSTRAINT_ERR) {
        throw new BadRequestException(
          `Unique constraint failed on the constraint: ${err?.meta?.target as string}`,
        );
      }
      if (err.code === PRISMA_ERROR.QUERY_INTERPRETATION_ERR) {
        // parent document Not found in connect query
        if (
          (err.meta?.details as string)?.includes(
            '"Required exactly one parent ID to be present for connect query',
          )
        )
          throw httpException;
      }
    }
    // console.log(err);
    throw err;
  }
}

function getExtendedClient() {
  const client = () => {
    return new PrismaClient().$extends({
      model: {
        $allModels: {
          async findManyPaginated<T, I extends Prisma.Args<T, 'findMany'>>(
            this: T,
            args: I,
            paginate: {
              page?: number;
              limit?: number;
              orderBy: Prisma.SortOrder;
            },
          ): Promise<Prisma.Result<T, I, 'findMany'>> {
            // Get the current model at runtime
            const context = Prisma.getExtensionContext(this) as any;

            const { page = 1, limit = 0, orderBy } = paginate || {};
            return context.findMany({
              skip: (page - 1) * limit || undefined,
              take: limit || undefined,
              orderBy: {
                id: orderBy,
              },
              ...args,
            }) as Promise<Prisma.Result<T, I, 'findMany'>>;
          },

          async findRandom<
            T,
            I extends Prisma.Args<T, 'findMany'>,
            R extends Prisma.Result<T, I, 'findMany'>,
          >(this: T, args: I, count: number = 1): Promise<R> {
            // Get the current model at runtime
            const context = Prisma.getExtensionContext(this) as any;

            // First, get the total count of records matching the filter
            const totalCount = (await context.count({
              where: args.where,
            })) as number;

            if (totalCount === 0) {
              return [] as R;
            }

            // Ensure count doesn't exceed total available records
            const actualCount = Math.min(count, totalCount);

            // If we need all records or a large percentage, it's more efficient to fetch all and shuffle
            if (actualCount > totalCount * 0.5) {
              const allRecords = (await context.findMany(args)) as R;

              // Fisher-Yates shuffle algorithm
              for (let i = allRecords.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [allRecords[i], allRecords[j]] = [allRecords[j], allRecords[i]];
              }

              return allRecords.slice(0, actualCount) as R;
            }

            // Generate random indices
            const randomIndices = new Set<number>();
            while (randomIndices.size < actualCount) {
              randomIndices.add(Math.floor(Math.random() * totalCount));
            }

            // Convert to sorted array for efficient database queries
            const sortedIndices = Array.from(randomIndices).sort(
              (a, b) => a - b,
            );

            // For smaller counts, use skip/take approach
            const results = [];
            for (const index of sortedIndices) {
              const record = (await context.findMany({
                ...args,
                skip: index,
                take: 1,
              })) as R;
              if (record.length > 0) {
                results.push(record[0]);
              }
            }

            // Shuffle the results to maintain randomness
            for (let i = results.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [results[i], results[j]] = [results[j], results[i]];
            }

            return results as R;
          },
          async updateOrThrow<T, I extends Prisma.Args<T, 'update'>>(
            this: T,
            args: I,
            err?: HttpException,
          ): Promise<Prisma.Result<T, I, 'update'>> {
            // Get the current model at runtime
            const context = Prisma.getExtensionContext(this) as any;
            return prismaNotFoundErrorWrapper(
              context.update(args) as Promise<Prisma.Result<T, I, 'update'>>,
              {
                notFoundException:
                  err || new BadRequestException(`${this['name']} Not Found`),
              },
            );
          },

          /** throw when nested connect relation not found */
          async createOrThrow<T, I extends Prisma.Args<T, 'create'>>(
            this: T,
            args: I,
            relationErrorMessage?: string,
          ): Promise<Prisma.Result<T, I, 'create'>> {
            // Get the current model at runtime
            const context = Prisma.getExtensionContext(this) as any;
            return prismaNotFoundErrorWrapper(
              context.create(args) as Promise<Prisma.Result<T, I, 'create'>>,
              {
                relationErrorMessage,
              },
            );
          },

          async findFirstOrThrow<T, I extends Prisma.Args<T, 'findFirst'>>(
            this: T,
            args: I,
            err?: HttpException,
          ): Promise<Prisma.Result<T, I, 'findFirst'>> {
            // Get the current model at runtime
            const context = Prisma.getExtensionContext(this) as any;
            return prismaNotFoundErrorWrapper(
              context.findFirst(args) as Promise<
                Prisma.Result<T, I, 'findFirst'>
              >,
              {
                notFoundException:
                  err || new BadRequestException(`${this['name']} Not Found`),
              },
            );
          },

          async deleteOrThrow<T, I extends Prisma.Args<T, 'delete'>>(
            this: T,
            args: I,
            err?: HttpException,
          ): Promise<Prisma.Result<T, I, 'delete'>> {
            // Get the current model at runtime
            const context = Prisma.getExtensionContext(this) as any;
            return prismaNotFoundErrorWrapper(
              context.delete(args) as Promise<Prisma.Result<T, I, 'delete'>>,
              {
                notFoundException:
                  err || new BadRequestException(`${this['name']} Not Found`),
              },
            );
          },
        },
      },
    });
  };

  return class {
    constructor() {
      return client();
    }
  } as new () => ReturnType<typeof client>;
}

@Injectable()
export class PrismaService extends getExtendedClient() implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
