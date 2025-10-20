import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, shareReplay, switchMap, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Location {
  id: string;
  name: string;
  address: string | null;
  city: string;
  type:
    | 'GAME_STORE'
    | 'CAFE'
    | 'BAR'
    | 'COMMUNITY_CENTER'
    | 'PRIVATE'
    | 'OTHER';
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
  providedIn: 'root',
})
export class LocationsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/locations`;
  private refreshLocations$ = new BehaviorSubject<void>(undefined);
  private latestLocations: Location[] | null = null;
  private locations$ = this.refreshLocations$.pipe(
    switchMap(() => this.http.get<Location[]>(this.apiUrl)),
    tap((locations) => {
      this.latestLocations = locations;
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  getLocations(): Observable<Location[]> {
    return this.locations$;
  }

  getLocation(id: string): Observable<Location> {
    return this.http.get<Location>(`${this.apiUrl}/${id}`);
  }

  // TODO Day 4: Implement POST/PATCH/DELETE
  createLocation(data: Partial<Location>): Observable<Location> {
    void data;
    throw new Error('Not implemented yet');
  }

  updateLocation(id: string, data: Partial<Location>): Observable<Location> {
    void id;
    void data;
    throw new Error('Not implemented yet');
  }

  deleteLocation(id: string): Observable<void> {
    void id;
    throw new Error('Not implemented yet');
  }

  invalidateLocationsCache(): void {
    this.refreshLocations$.next();
  }

  getCachedLocationsSnapshot(): Location[] | null {
    return this.latestLocations;
  }
}
