import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Group {
  id: string;
  name: string;
  description: string;
  playstyle: 'COMPETITIVE' | 'CASUAL' | 'STORY_DRIVEN' | 'SANDBOX';
  isRecruiting: boolean;
  isPublic: boolean;
  maxMembers: number | null;
  createdAt: string;
  updatedAt: string;
  creatorId: string;
  creator?: {
    id: string;
    username: string;
    avatar: string | null;
  };
  _count?: {
    members: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class GroupsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/groups`;

  getGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(this.apiUrl);
  }

  getGroup(id: string): Observable<Group> {
    return this.http.get<Group>(`${this.apiUrl}/${id}`);
  }

  // TODO Day 4: Implement POST/PATCH/DELETE
  createGroup(data: Partial<Group>): Observable<Group> {
    void data;
    throw new Error('Not implemented yet');
  }

  updateGroup(id: string, data: Partial<Group>): Observable<Group> {
    void id;
    void data;
    throw new Error('Not implemented yet');
  }

  deleteGroup(id: string): Observable<void> {
    void id;
    throw new Error('Not implemented yet');
  }
}
