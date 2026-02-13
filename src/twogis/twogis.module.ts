import { Module } from '@nestjs/common';
import { TwogisController } from './twogis.controller';
import { TwogisService } from './twogis.service';

@Module({
  controllers: [TwogisController],
  providers: [TwogisService],
  exports: [TwogisService],
})
export class TwogisModule {}

