import { Module } from '@nestjs/common';
import { ApartmentsModule } from './apartments/apartments.module';
import { HealthController } from './health.controller';
import { PrismaModule } from './prisma/prisma.module';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [PrismaModule, StorageModule, ApartmentsModule],
  controllers: [HealthController],
})
export class AppModule {}
