import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Poll {
  id: string;
  title: string;
  dates: string[];
  votes: Record<string, string>; // userId -> dateChoice
  createdAt: string;
  updatedAt: string;
  groupId: string;
  group?: {
    id: string;
    name: string;
  };
  voteCounts?: Record<string, number>;
  voteDetails?: Record<string, Array<{ userId: string; username: string }>>;
  bestDate?: string | null;
  totalVotes?: number;
}

export interface CreatePollDto {
  title: string;
  dates: string[];
  groupId: string;
}

export interface VotePollDto {
  userId: string;
  dateChoice: string;
}

@Injectable({
  providedIn: 'root'
})
export class PollsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/polls`;

  getPolls(groupId?: string): Observable<Poll[]> {
    const url = groupId ? `${this.apiUrl}?groupId=${groupId}` : this.apiUrl;
    return this.http.get<Poll[]>(url);
  }

  getPoll(id: string): Observable<Poll> {
    return this.http.get<Poll>(`${this.apiUrl}/${id}`);
  }

  createPoll(data: CreatePollDto): Observable<Poll> {
    return this.http.post<Poll>(this.apiUrl, data);
  }

  vote(pollId: string, data: VotePollDto): Observable<Poll> {
    return this.http.patch<Poll>(`${this.apiUrl}/${pollId}/vote`, data);
  }

  removeVote(pollId: string, userId: string): Observable<Poll> {
    return this.http.delete<Poll>(`${this.apiUrl}/${pollId}/vote/${userId}`);
  }

  deletePoll(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
