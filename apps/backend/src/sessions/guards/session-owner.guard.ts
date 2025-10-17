import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Guard pour vérifier que l'utilisateur connecté est le créateur de la session
 */
@Injectable()
export class SessionOwnerGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Injecté par JwtAuthGuard
    const sessionId = request.params.id;

    if (!user || !user.sub) {
      throw new ForbiddenException('User not authenticated');
    }

    // Vérifier que la session existe
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      select: { hostId: true },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Vérifier que l'utilisateur est le créateur
    if (session.hostId !== user.sub) {
      throw new ForbiddenException('You are not the owner of this session');
    }

    return true;
  }
}
