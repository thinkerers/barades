import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../prisma/prisma.module';
import { SessionsModule } from '../sessions/sessions.module';
import { LocationsModule } from '../locations/locations.module';
import { GroupsModule } from '../groups/groups.module';

@Module({
  imports: [PrismaModule, SessionsModule, LocationsModule, GroupsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
