import { SetMetadata } from '@nestjs/common';

export const IS_OPTIONAL_KEY = 'isOptional';
export const OptionalAuth = () => SetMetadata(IS_OPTIONAL_KEY, true);
