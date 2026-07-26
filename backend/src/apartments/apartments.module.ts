import { Module } from '@nestjs/common';
import { ApartmentsController } from './apartments.controller';
import { ApartmentsService } from './apartments.service';
import { SeedService } from './seed.service';

@Module({
  controllers: [ApartmentsController],
  providers: [ApartmentsService, SeedService],
})
export class ApartmentsModule {}
