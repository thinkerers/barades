import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SessionOwnerGuard } from './guards/session-owner.guard';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';

@Module({
  imports: [AuthModule],
  controllers: [SessionsController],
  providers: [SessionsService, SessionOwnerGuard],
})
export class SessionsModule {}
