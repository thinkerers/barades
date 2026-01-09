import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

export interface GeocodingResult {
  lat: number;
  lon: number;
  display_name: string;
}

@Injectable({
  providedIn: 'root',
})
export class GeocodingService {
  private http = inject(HttpClient);
  private readonly NAMING_URL = 'https://nominatim.openstreetmap.org/search';

  searchAddress(query: string): Observable<GeocodingResult[]> {
    const params = new HttpParams()
      .set('q', query)
      .set('format', 'json')
      .set('limit', '5');

    return this.http.get<any[]>(this.NAMING_URL, { params }).pipe(
      map((results) =>
        results.map((r) => ({
          lat: parseFloat(r.lat),
          lon: parseFloat(r.lon),
          display_name: r.display_name,
        }))
      )
    );
  }
}
