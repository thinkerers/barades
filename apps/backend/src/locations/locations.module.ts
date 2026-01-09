import { Module } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { LocationsController } from './locations.controller';
import { AuthModule } from '../auth/auth.module';
import { LocationOwnerGuard } from './guards/location-owner.guard';

@Module({
  imports: [AuthModule],
  controllers: [LocationsController],
  providers: [LocationsService, LocationOwnerGuard],
})
export class LocationsModule {}
