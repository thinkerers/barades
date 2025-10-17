import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { UsersService, UpdateProfileDto, UserProfile } from './users.service';
import { environment } from '../../../environments/environment';

describe('UsersService', () => {
  let service: UsersService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UsersService],
    });

    service = TestBed.inject(UsersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getMyProfile', () => {
    it('should fetch current user profile', () => {
      const mockProfile: UserProfile = {
        id: '1',
        email: 'alice@example.com',
        username: 'alice_dm',
        firstName: 'Alice',
        lastName: 'Dupont',
        bio: 'D&D enthusiast',
        avatar: null,
        skillLevel: 'INTERMEDIATE',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };

      service.getMyProfile().subscribe((profile) => {
        expect(profile).toEqual(mockProfile);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users/me`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProfile);
    });
  });

  describe('updateMyProfile', () => {
    it('should update current user profile', () => {
      const dto: UpdateProfileDto = {
        firstName: 'Alice',
        lastName: 'Dupont',
        bio: 'Updated bio',
        skillLevel: 'EXPERT',
      };

      const mockUpdatedProfile: UserProfile = {
        id: '1',
        email: 'alice@example.com',
        username: 'alice_dm',
        firstName: 'Alice',
        lastName: 'Dupont',
        bio: 'Updated bio',
        avatar: null,
        skillLevel: 'EXPERT',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-10T00:00:00Z',
      };

      service.updateMyProfile(dto).subscribe((profile) => {
        expect(profile).toEqual(mockUpdatedProfile);
        expect(profile.bio).toBe('Updated bio');
        expect(profile.skillLevel).toBe('EXPERT');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users/me`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(dto);
      req.flush(mockUpdatedProfile);
    });

    it('should handle partial updates', () => {
      const dto: UpdateProfileDto = {
        bio: 'New bio only',
      };

      const mockUpdatedProfile: UserProfile = {
        id: '1',
        email: 'alice@example.com',
        username: 'alice_dm',
        firstName: 'Alice',
        lastName: 'Dupont',
        bio: 'New bio only',
        avatar: null,
        skillLevel: 'INTERMEDIATE',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-10T00:00:00Z',
      };

      service.updateMyProfile(dto).subscribe((profile) => {
        expect(profile.bio).toBe('New bio only');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users/me`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(dto);
      req.flush(mockUpdatedProfile);
    });
  });
});
