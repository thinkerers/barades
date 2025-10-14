import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Location {
  id: string;
  name: string;
  address: string | null;
  city: string;
  type: 'GAME_STORE' | 'CAFE' | 'BAR' | 'COMMUNITY_CENTER' | 'PRIVATE' | 'OTHER';
  rating: number;
  amenities: string[];
  capacity: number | null;
  openingHours: Record<string, string> | null;
  icon: string;
  lat: number;
  lon: number;
  website: string | null;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class LocationsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/locations`;

  getLocations(): Observable<Location[]> {
    return this.http.get<Location[]>(this.apiUrl);
  }

  getLocation(id: string): Observable<Location> {
    return this.http.get<Location>(`${this.apiUrl}/${id}`);
  }

  // TODO Day 4: Implement POST/PATCH/DELETE
  createLocation(_data: Partial<Location>): Observable<Location> {
    throw new Error('Not implemented yet');
  }

  updateLocation(_id: string, _data: Partial<Location>): Observable<Location> {
    throw new Error('Not implemented yet');
  }

  deleteLocation(_id: string): Observable<void> {
    throw new Error('Not implemented yet');
  }
}
