import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { SignupDto, LoginDto } from './dto/auth.dto';

// Mock argon2
jest.mock('argon2');

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  const mockUser = {
    id: 'user-1',
    username: 'testuser',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    passwordHash: 'hashed-password',
    avatar: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signup', () => {
    const validSignupDto: SignupDto = {
      email: 'newuser@example.com',
      username: 'newuser',
      password: 'ValidPassword123!',
      confirmPassword: 'ValidPassword123!',
      firstName: 'New',
      lastName: 'User',
    };

    it('should successfully create a new user', async () => {
      // Arrange
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      (argon2.hash as jest.Mock).mockResolvedValue('hashed-password');

      // Act
      const result = await service.signup(validSignupDto);

      // Assert
      expect(result).toEqual({ accessToken: 'mock-jwt-token' });
      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { email: validSignupDto.email },
            { username: validSignupDto.username },
          ],
        },
      });
      expect(argon2.hash).toHaveBeenCalledWith(validSignupDto.password);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: validSignupDto.email,
          username: validSignupDto.username,
          passwordHash: 'hashed-password',
          firstName: validSignupDto.firstName,
          lastName: validSignupDto.lastName,
        },
      });
    });

    it('should hash password with argon2', async () => {
      // Arrange
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      (argon2.hash as jest.Mock).mockResolvedValue('hashed-password');

      // Act
      await service.signup(validSignupDto);

      // Assert
      expect(argon2.hash).toHaveBeenCalledWith(validSignupDto.password);
    });

    it('should generate JWT token after signup', async () => {
      // Arrange
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      (argon2.hash as jest.Mock).mockResolvedValue('hashed-password');

      // Act
      const result = await service.signup(validSignupDto);

      // Assert
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        username: mockUser.username,
        email: mockUser.email,
      });
      expect(result.accessToken).toBe('mock-jwt-token');
    });

    it('should throw BadRequestException when passwords do not match', async () => {
      // Arrange
      const invalidDto: SignupDto = {
        ...validSignupDto,
        confirmPassword: 'DifferentPassword123!',
      };

      // Act & Assert
      await expect(service.signup(invalidDto)).rejects.toThrow(BadRequestException);
      await expect(service.signup(invalidDto)).rejects.toThrow('Passwords do not match');
    });

    it('should throw BadRequestException when password is too short', async () => {
      // Arrange
      const invalidDto: SignupDto = {
        ...validSignupDto,
        password: 'Short1!',
        confirmPassword: 'Short1!',
      };

      // Act & Assert
      await expect(service.signup(invalidDto)).rejects.toThrow(BadRequestException);
      await expect(service.signup(invalidDto)).rejects.toThrow(
        'Password must be at least 12 characters long'
      );
    });

    it('should throw ConflictException when email already exists', async () => {
      // Arrange
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(service.signup(validSignupDto)).rejects.toThrow(ConflictException);
      await expect(service.signup(validSignupDto)).rejects.toThrow(
        'User with this email or username already exists'
      );
    });

    it('should throw ConflictException when username already exists', async () => {
      // Arrange
      const existingUser = { ...mockUser, email: 'different@example.com' };
      mockPrismaService.user.findFirst.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(service.signup(validSignupDto)).rejects.toThrow(ConflictException);
    });

    it('should accept password with exactly 12 characters', async () => {
      // Arrange
      const dtoWith12Chars: SignupDto = {
        ...validSignupDto,
        password: 'Valid12Chars',
        confirmPassword: 'Valid12Chars',
      };
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      (argon2.hash as jest.Mock).mockResolvedValue('hashed-password');

      // Act
      const result = await service.signup(dtoWith12Chars);

      // Assert
      expect(result).toEqual({ accessToken: 'mock-jwt-token' });
    });
  });

  describe('login', () => {
    const validLoginDto: LoginDto = {
      username: 'testuser',
      password: 'ValidPassword123!',
    };

    it('should successfully login with correct credentials', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await service.login(validLoginDto);

      // Assert
      expect(result).toEqual({ accessToken: 'mock-jwt-token' });
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { username: validLoginDto.username },
      });
      expect(argon2.verify).toHaveBeenCalledWith(
        mockUser.passwordHash,
        validLoginDto.password
      );
    });

    it('should verify password with argon2', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(true);

      // Act
      await service.login(validLoginDto);

      // Assert
      expect(argon2.verify).toHaveBeenCalledWith(
        mockUser.passwordHash,
        validLoginDto.password
      );
    });

    it('should generate JWT token after successful login', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await service.login(validLoginDto);

      // Assert
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        username: mockUser.username,
        email: mockUser.email,
      });
      expect(result.accessToken).toBe('mock-jwt-token');
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.login(validLoginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(validLoginDto)).rejects.toThrow(
        'Username or password may be incorrect. Please try again'
      );
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(service.login(validLoginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(validLoginDto)).rejects.toThrow(
        'Username or password may be incorrect. Please try again'
      );
    });

    it('should not reveal whether user exists (prevent user enumeration)', async () => {
      // Arrange - test with non-existent user
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      const errorMessage1 = service
        .login(validLoginDto)
        .catch((e) => e.message);

      // Arrange - test with wrong password
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      const errorMessage2 = service
        .login(validLoginDto)
        .catch((e) => e.message);

      // Both should have the same generic error message
      expect(await errorMessage1).toBe(await errorMessage2);
    });

    it('should handle argon2.verify errors gracefully', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockRejectedValue(new Error('Argon2 error'));

      // Act & Assert
      await expect(service.login(validLoginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(validLoginDto)).rejects.toThrow(
        'Username or password may be incorrect. Please try again'
      );
    });
  });
});
