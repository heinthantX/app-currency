import { Global, Module } from '@nestjs/common';
import { services } from './services';

@Module({
  controllers: [],
  providers: [...services],
  exports: [...services],
})
@Global()
export class CommonModule {}
