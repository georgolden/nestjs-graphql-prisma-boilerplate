import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { OAuthService } from './services/oauth.service';
import { SessionService } from './services/session.service';

@Module({
  imports: [PrismaModule],
  providers: [AuthService, AuthResolver, OAuthService, SessionService],
  exports: [AuthService, SessionService],
})
export class AuthModule {}
