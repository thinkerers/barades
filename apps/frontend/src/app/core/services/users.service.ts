import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatar?: string;
  skillLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT';
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatar?: string | null;
  skillLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT';
  createdAt: string;
  updatedAt: string;
}

export interface ActionItems {
  upcomingSessions: Array<{
    id: string;
    userId: string;
    sessionId: string;
    status: string;
    session: {
      id: string;
      title: string;
      date: string;
      game: string;
      location: {
        name: string;
      } | null;
    };
  }>;
  pendingReservations: Array<{
    id: string;
    userId: string;
    sessionId: string;
    status: string;
    user: {
      id: string;
      username: string;
      avatar: string | null;
    };
    session: {
      id: string;
      title: string;
      date: string;
    };
  }>;
}

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;

  /**
   * Get current user profile
   */
  getMyProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.API_URL}/users/me`);
  }

  /**
   * Update current user profile
   */
  updateMyProfile(dto: UpdateProfileDto): Observable<UserProfile> {
    return this.http.patch<UserProfile>(`${this.API_URL}/users/me`, dto);
  }

  /**
   * Get action items for the current user
   * Returns upcoming sessions and pending reservations
   */
  getActionItems(): Observable<ActionItems> {
    return this.http.get<ActionItems>(`${this.API_URL}/users/me/action-items`);
  }
}
