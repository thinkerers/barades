import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Guard pour vérifier que l'utilisateur connecté est le créateur du lieu
 */
@Injectable()
export class LocationOwnerGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Injecté par JwtAuthGuard
    const locationId = request.params.id;

    if (!user || !user.sub) {
      throw new ForbiddenException('User not authenticated');
    }

    // Vérifier que le lieu existe
    const location = await this.prisma.location.findUnique({
      where: { id: locationId },
      select: { creatorId: true },
    });

    if (!location) {
      throw new NotFoundException('Location not found');
    }

    // Vérifier que l'utilisateur est le créateur
    if (location.creatorId !== user.sub) {
      throw new ForbiddenException('You are not the owner of this location');
    }

    return true;
  }
}
