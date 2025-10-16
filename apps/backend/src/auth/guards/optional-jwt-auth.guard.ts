import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

/**
 * Optional JWT Guard
 * Allows requests to proceed whether or not a valid JWT is present
 * If a valid token is present, attaches user to request
 * If no token or invalid token, request proceeds without user
 */
@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = this.getRequest(context);

    try {
      const token = this.extractTokenFromHeader(request);
      if (token) {
        const payload = this.jwtService.verify(token);
        request['user'] = payload;
      }
    } catch {
      // Token invalide ou expiré, on continue sans user
      // Pas d'erreur, on laisse passer
    }

    return true;
  }

  private getRequest(context: ExecutionContext): Request {
    return context.switchToHttp().getRequest<Request>();
  }

  private extractTokenFromHeader(request: Request): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader) return null;

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : null;
  }
}
