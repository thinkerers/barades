import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Reservation {
  id: string;
  sessionId: string;
  userId: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  message?: string;
  createdAt: string;
  user?: {
    id: string;
    username: string;
    avatar?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
  };
  session?: unknown; // Type complet à définir si nécessaire
}

export interface CreateReservationRequest {
  sessionId: string;
  userId: string;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReservationsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/reservations`;

  createReservation(sessionId: string, userId: string, message?: string): Observable<Reservation> {
    const payload: CreateReservationRequest = {
      sessionId,
      userId,
      message
    };

    return this.http.post<Reservation>(this.apiUrl, payload);
  }

  getReservations(userId?: string): Observable<Reservation[]> {
    const params = userId ? { userId } : {};
    return this.http.get<Reservation[]>(this.apiUrl, { params });
  }

  getReservation(id: string): Observable<Reservation> {
    return this.http.get<Reservation>(`${this.apiUrl}/${id}`);
  }

  cancelReservation(id: string): Observable<Reservation> {
    return this.http.delete<Reservation>(`${this.apiUrl}/${id}`);
  }
}
