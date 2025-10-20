import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { NotificationService } from '../../core/services/notification.service';
import { Poll, PollsService } from '../../core/services/polls.service';

@Component({
  selector: 'app-poll-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './poll-widget.html',
  styleUrl: './poll-widget.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PollWidgetComponent {
  private readonly pollsService = inject(PollsService);
  private readonly notifications = inject(NotificationService);
  @Input() poll: Poll | null = null;
  @Input() groupId = '';
  @Input() currentUserId: string | null = null;
  @Input() isMember = false;
  @Output() pollCreated = new EventEmitter<Poll>();
  @Output() voted = new EventEmitter<void>();

  // Create poll mode
  readonly showCreateForm = signal(false);
  readonly pollTitle = signal('');
  readonly selectedDates = signal<string[]>([]);
  readonly newDateInput = signal('');
  readonly creating = signal(false);
  readonly error = signal<string | null>(null);

  toggleCreateForm(): void {
    const nextVisible = !this.showCreateForm();
    this.showCreateForm.set(nextVisible);
    if (!nextVisible) {
      this.resetForm();
    }
  }

  addDate(): void {
    const pendingDate = this.newDateInput().trim();
    if (!pendingDate) {
      return;
    }

    if (!this.selectedDates().includes(pendingDate)) {
      this.selectedDates.update((dates) => [...dates, pendingDate]);
    }
    this.newDateInput.set('');
  }

  removeDate(date: string): void {
    this.selectedDates.update((dates) => dates.filter((d) => d !== date));
  }

  async createPoll(): Promise<void> {
    const title = this.pollTitle().trim();
    const dates = this.selectedDates();

    if (!title || dates.length < 2) {
      this.error.set('Le titre et au moins 2 dates sont requis');
      return;
    }

    this.creating.set(true);
    this.error.set(null);

    try {
      const poll = await firstValueFrom(
        this.pollsService.createPoll({
          title,
          dates,
          groupId: this.groupId,
        })
      );
      this.pollCreated.emit(poll);
      this.resetForm();
      this.showCreateForm.set(false);
    } catch (error) {
      console.error('Error creating poll:', error);
      if (error instanceof HttpErrorResponse) {
        if (error.status === 403) {
          this.error.set(
            'Vous devez être membre du groupe pour créer un sondage'
          );
        } else if (error.status === 401) {
          this.error.set('Vous devez être connecté pour créer un sondage');
        } else {
          this.error.set('Erreur lors de la création du sondage');
        }
      } else {
        this.error.set('Erreur lors de la création du sondage');
      }
    } finally {
      this.creating.set(false);
    }
  }

  async vote(dateChoice: string): Promise<void> {
    if (!this.poll || !this.currentUserId) return;

    try {
      await firstValueFrom(
        this.pollsService.vote(this.poll.id, {
          userId: this.currentUserId,
          dateChoice,
        })
      );
      this.voted.emit();
    } catch (error) {
      console.error('Error voting:', error);
      if (error instanceof HttpErrorResponse) {
        if (error.status === 403) {
          this.notifications.error(
            'Vous devez être membre du groupe pour voter.'
          );
        } else if (error.status === 401) {
          this.notifications.error('Vous devez être connecté pour voter.');
        } else {
          this.notifications.error('Erreur lors du vote.');
        }
      } else {
        this.notifications.error('Erreur lors du vote.');
      }
    }
  }

  async removeMyVote(): Promise<void> {
    if (!this.poll || !this.currentUserId) return;

    try {
      await firstValueFrom(
        this.pollsService.removeVote(this.poll.id, this.currentUserId)
      );
      this.voted.emit();
    } catch (error) {
      console.error('Error removing vote:', error);
      if (error instanceof HttpErrorResponse) {
        if (error.status === 403) {
          this.notifications.error(
            'Vous devez être membre du groupe pour supprimer votre vote.'
          );
        } else if (error.status === 401) {
          this.notifications.error(
            'Vous devez être connecté pour supprimer votre vote.'
          );
        } else {
          this.notifications.error('Erreur lors de la suppression du vote.');
        }
      } else {
        this.notifications.error('Erreur lors de la suppression du vote.');
      }
    }
  }

  getUserVote(): string | null {
    if (!this.poll || !this.poll.votes || !this.currentUserId) return null;
    return this.poll.votes[this.currentUserId] || null;
  }

  getVoteCount(date: string): number {
    return this.poll?.voteCounts?.[date] || 0;
  }

  getVotePercentage(date: string): number {
    if (!this.poll?.totalVotes || this.poll.totalVotes === 0) return 0;
    const count = this.getVoteCount(date);
    return Math.round((count / this.poll.totalVotes) * 100);
  }

  isBestDate(date: string): boolean {
    return this.poll?.bestDate === date;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-BE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  private resetForm(): void {
    this.pollTitle.set('');
    this.selectedDates.set([]);
    this.newDateInput.set('');
    this.error.set(null);
  }
}
