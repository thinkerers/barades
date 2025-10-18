import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// Types (à synchroniser avec le backend Prisma)
export interface Session {
  id: string;
  game: string;
  title: string;
  description: string | null;
  date: string;
  recurrenceRule: string | null;
  recurrenceEndDate: string | null;
  online: boolean;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'OPEN';
  playersMax: number;
  playersCurrent: number;
  tagColor: 'RED' | 'GREEN' | 'PURPLE' | 'BLUE' | 'GRAY';
  createdAt: string;
  updatedAt: string;
  hostId: string;
  locationId: string | null;

  // Relations incluses
  host?: {
    id: string;
    username: string;
    avatar: string | null;
  };
  location?: {
    id: string;
    name: string;
    city: string;
    type: string;
    lat: number;
    lon: number;
  };
  reservations?: Array<{
    id: string;
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
    user: {
      id: string;
      username: string;
      avatar: string | null;
    };
  }>;
}

@Injectable({
  providedIn: 'root',
})
export class SessionsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/sessions`;

  /**
   * Récupère toutes les sessions avec leurs relations
   */
  getSessions(): Observable<Session[]> {
    return this.http.get<Session[]>(this.apiUrl);
  }

  /**
   * Retrieve sessions hosted by the authenticated user
   */
  getSessionsHostedByMe(): Observable<Session[]> {
    return this.http.get<Session[]>(`${this.apiUrl}/created-by-me`);
  }

  /**
   * Récupère une session par ID avec détails complets
   */
  getSession(id: string): Observable<Session> {
    return this.http.get<Session>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crée une nouvelle session (à implémenter Jour 4)
   */
  createSession(session: Partial<Session>): Observable<Session> {
    return this.http.post<Session>(this.apiUrl, session);
  }

  /**
   * Met à jour une session existante (à implémenter Jour 4)
   */
  updateSession(id: string, session: Partial<Session>): Observable<Session> {
    return this.http.patch<Session>(`${this.apiUrl}/${id}`, session);
  }

  /**
   * Supprime une session (à implémenter Jour 4)
   */
  deleteSession(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get statistics about sessions created by the current user
   * Returns total count and recent count (last 7 days)
   */
  getCreatedByMeStats(): Observable<{
    totalCount: number;
    recentCount: number;
    period: string;
  }> {
    return this.http.get<{
      totalCount: number;
      recentCount: number;
      period: string;
    }>(`${this.apiUrl}/stats/created-by-me`);
  }
}
