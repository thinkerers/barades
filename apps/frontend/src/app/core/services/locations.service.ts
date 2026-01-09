import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, shareReplay, switchMap, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Location {
  id: string;
  name: string;
  address: string | null;
  city: string;
  type: LocationType;
  rating: number;
  amenities: string[];
  capacity: number | null;
  openingHours: Record<string, string> | null;
  icon: string;
  lat: number;
  lon: number;
  website: string | null;
  isPrivate: boolean;
  creatorId: string | null;
  createdAt: string;
  updatedAt: string;
}

export type LocationType =
  | 'BAR'
  | 'CAFE'
  | 'GAME_STORE'
  | 'COMMUNITY_CENTER'
  | 'PRIVATE';

export interface CreateLocationData {
  name: string;
  address?: string;
  city: string;
  type: LocationType;
  lat: number;
  lon: number;
  amenities?: string[];
  capacity?: number;
  website?: string;
  icon?: string;
  isPrivate?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class LocationsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/locations`;
  private refreshLocations$ = new BehaviorSubject<void>(undefined);
  private refreshCreatedLocations$ = new BehaviorSubject<void>(undefined);
  private latestLocations: Location[] | null = null;
  private latestCreatedLocations: Location[] | null = null;
  private locations$ = this.refreshLocations$.pipe(
    switchMap(() => this.http.get<Location[]>(this.apiUrl)),
    tap((locations) => {
      this.latestLocations = locations;
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );
  private createdLocations$ = this.refreshCreatedLocations$.pipe(
    switchMap(() => this.http.get<Location[]>(`${this.apiUrl}/created-by-me`)),
    tap((locations) => {
      this.latestCreatedLocations = locations;
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  getLocations(): Observable<Location[]> {
    return this.locations$;
  }

  getLocationsCreatedByMe(): Observable<Location[]> {
    return this.createdLocations$;
  }

  getLocation(id: string): Observable<Location> {
    return this.http.get<Location>(`${this.apiUrl}/${id}`);
  }

  createLocation(data: CreateLocationData): Observable<Location> {
    return this.http.post<Location>(this.apiUrl, data).pipe(
      tap(() => this.invalidateLocationsCache())
    );
  }

  updateLocation(id: string, data: Partial<Location>): Observable<Location> {
    return this.http.patch<Location>(`${this.apiUrl}/${id}`, data).pipe(
      tap(() => this.invalidateLocationsCache())
    );
  }

  deleteLocation(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.invalidateLocationsCache())
    );
  }

  invalidateLocationsCache(): void {
    this.refreshLocations$.next();
    this.refreshCreatedLocations$.next();
  }

  getCachedLocationsSnapshot(): Location[] | null {
    return this.latestLocations;
  }

  getCachedCreatedLocationsSnapshot(): Location[] | null {
    return this.latestCreatedLocations;
  }
}
