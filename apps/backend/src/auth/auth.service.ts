import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as argon2 from 'argon2';
import { SignupDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  /**
   * Create a new user account
   */
  async signup(dto: SignupDto): Promise<{ accessToken: string }> {
    // Validate passwords match
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Validate password length (minimum 12 characters per Trilon article)
    if (dto.password.length < 12) {
      throw new BadRequestException(
        'Password must be at least 12 characters long'
      );
    }

    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { username: dto.username }],
      },
    });

    if (existingUser) {
      throw new ConflictException(
        'User with this email or username already exists'
      );
    }

    // Hash password with argon2
    const passwordHash = await argon2.hash(dto.password);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
      },
    });

    // Generate JWT token
    return this.createAccessToken(user.id, user.username, user.email);
  }

  /**
   * Authenticate existing user
   */
  async login(dto: LoginDto): Promise<{ accessToken: string }> {
    try {
      // Find user by username
      const user = await this.prisma.user.findUnique({
        where: { username: dto.username },
      });

      if (!user) {
        throw new Error();
      }

      // Verify password
      const passwordMatch = await argon2.verify(
        user.passwordHash,
        dto.password
      );

      if (!passwordMatch) {
        throw new Error();
      }

      // Generate JWT token
      return this.createAccessToken(user.id, user.username, user.email);
    } catch {
      // Generic error message to prevent user enumeration
      throw new UnauthorizedException(
        'Username or password may be incorrect. Please try again'
      );
    }
  }

  /**
   * Create JWT access token with user payload
   */
  private createAccessToken(
    userId: string,
    username: string,
    email: string
  ): { accessToken: string } {
    const payload = {
      sub: userId,
      username,
      email,
    };

    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }
}
