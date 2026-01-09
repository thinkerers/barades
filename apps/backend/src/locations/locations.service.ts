import { Injectable } from '@nestjs/common';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LocationsService {
  constructor(private prisma: PrismaService) {}

  create(createLocationDto: CreateLocationDto, creatorId: string) {
    return this.prisma.location.create({
      data: {
        name: createLocationDto.name,
        address: createLocationDto.address,
        city: createLocationDto.city,
        type: createLocationDto.type,
        lat: createLocationDto.lat,
        lon: createLocationDto.lon,
        amenities: createLocationDto.amenities ?? [],
        capacity: createLocationDto.capacity,
        website: createLocationDto.website,
        icon: createLocationDto.icon ?? 'store',
        isPrivate: createLocationDto.isPrivate ?? false,
        creatorId,
      },
    });
  }

  /**
   * Récupère tous les lieux visibles pour un utilisateur donné.
   * - Lieux publics : visibles par tous
   * - Lieux privés : visibles uniquement par le créateur OU par les membres
   *   acceptés d'une session utilisant ce lieu
   */
  async findAll(userId?: string) {
    // D'abord, récupérer les IDs des lieux privés accessibles via des sessions
    let accessiblePrivateLocationIds: string[] = [];

    if (userId) {
      // Trouver les sessions où l'utilisateur a une réservation CONFIRMED
      const confirmedReservations = await this.prisma.reservation.findMany({
        where: {
          userId,
          status: 'CONFIRMED',
          session: {
            locationId: { not: null },
            location: { isPrivate: true },
          },
        },
        select: {
          session: {
            select: { locationId: true },
          },
        },
      });

      accessiblePrivateLocationIds = confirmedReservations
        .map((r) => r.session.locationId)
        .filter((id): id is string => id !== null);
    }

    return this.prisma.location.findMany({
      where: {
        OR: [
          // Lieux publics
          { isPrivate: false },
          // Lieux privés créés par l'utilisateur
          ...(userId ? [{ isPrivate: true, creatorId: userId }] : []),
          // Lieux privés accessibles via des sessions confirmées
          ...(accessiblePrivateLocationIds.length > 0
            ? [{ id: { in: accessiblePrivateLocationIds } }]
            : []),
        ],
      },
      include: {
        sessions: {
          where: {
            date: {
              gte: new Date(),
            },
          },
          orderBy: {
            date: 'asc',
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  /**
   * Récupère un lieu par son ID si l'utilisateur y a accès.
   */
  async findOne(id: string, userId?: string) {
    const location = await this.prisma.location.findUnique({
      where: { id },
      include: {
        sessions: {
          include: {
            host: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!location) return null;

    // Vérifier l'accès pour les lieux privés
    if (location.isPrivate) {
      // Le créateur a toujours accès
      if (location.creatorId === userId) {
        return location;
      }

      // Vérifier si l'utilisateur a une réservation confirmée pour une session dans ce lieu
      if (userId) {
        const hasAccess = await this.prisma.reservation.findFirst({
          where: {
            userId,
            status: 'CONFIRMED',
            session: { locationId: id },
          },
        });

        if (hasAccess) {
          return location;
        }
      }

      // Pas d'accès
      return null;
    }

    return location;
  }

  /**
   * Récupère tous les lieux créés par l'utilisateur
   */
  async findCreatedByMe(userId: string) {
    return this.prisma.location.findMany({
      where: {
        creatorId: userId,
      },
      include: {
        sessions: {
          where: {
            date: {
              gte: new Date(),
            },
          },
          orderBy: {
            date: 'asc',
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async update(id: string, updateLocationDto: UpdateLocationDto) {
    // Le guard LocationOwnerGuard a déjà vérifié :
    // - que le lieu existe
    // - que l'utilisateur est le créateur

    // Mettre à jour le lieu
    return this.prisma.location.update({
      where: { id },
      data: {
        name: updateLocationDto.name,
        address: updateLocationDto.address,
        city: updateLocationDto.city,
        type: updateLocationDto.type,
        lat: updateLocationDto.lat,
        lon: updateLocationDto.lon,
        amenities: updateLocationDto.amenities,
        capacity: updateLocationDto.capacity,
        website: updateLocationDto.website,
        isPrivate: updateLocationDto.isPrivate,
      },
    });
  }

  async remove(id: string) {
    // Le guard LocationOwnerGuard a déjà vérifié :
    // - que le lieu existe
    // - que l'utilisateur est le créateur

    return this.prisma.location.delete({
      where: { id },
    });
  }
}
