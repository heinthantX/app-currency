import { PrismaService } from './prisma.service';
export * from './prisma.service';

import { TypedConfigService } from './typed-config.service';
export * from './typed-config.service';

export const services = [PrismaService, TypedConfigService];
