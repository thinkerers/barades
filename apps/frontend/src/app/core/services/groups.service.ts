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
  currentUserIsMember?: boolean;
  creator?: {
    id: string;
    username: string;
    avatar: string | null;
  };
  members?: GroupMemberSummary[];
  _count?: {
    members: number;
  };
}

export interface GroupMemberSummary {
  userId: string;
  user?: {
    id: string;
    username: string;
    avatar: string | null;
  } | null;
}

export interface JoinGroupResponse {
  joined: boolean;
  groupId: string;
  memberCount: number;
  maxMembers: number | null;
  isRecruiting: boolean;
}

export interface LeaveGroupResponse {
  left: boolean;
  groupId: string;
  memberCount: number;
  maxMembers: number | null;
  isRecruiting: boolean;
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

  joinGroup(
    id: string,
    payload?: { message?: string }
  ): Observable<JoinGroupResponse> {
    return this.http.post<JoinGroupResponse>(
      `${this.apiUrl}/${id}/join`,
      payload ?? {}
    );
  }

  leaveGroup(id: string): Observable<LeaveGroupResponse> {
    return this.http.delete<LeaveGroupResponse>(`${this.apiUrl}/${id}/join`);
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
