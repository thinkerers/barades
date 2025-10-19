import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
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
})
export class PollWidgetComponent {
  private pollsService = inject(PollsService);
  private notifications = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);

  @Input() poll: Poll | null = null;
  @Input() groupId = '';
  @Input() currentUserId: string | null = null;
  @Input() isMember = false;
  @Output() pollCreated = new EventEmitter<Poll>();
  @Output() voted = new EventEmitter<void>();

  // Create poll mode
  showCreateForm = false;
  pollTitle = '';
  selectedDates: string[] = [];
  newDateInput = '';
  creating = false;
  error: string | null = null;

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (!this.showCreateForm) {
      this.resetForm();
    }
    this.cdr.markForCheck();
  }

  addDate(): void {
    if (this.newDateInput && !this.selectedDates.includes(this.newDateInput)) {
      this.selectedDates.push(this.newDateInput);
      this.newDateInput = '';
      this.cdr.markForCheck();
    }
  }

  removeDate(date: string): void {
    this.selectedDates = this.selectedDates.filter((d) => d !== date);
    this.cdr.markForCheck();
  }

  async createPoll(): Promise<void> {
    if (!this.pollTitle || this.selectedDates.length < 2) {
      this.error = 'Le titre et au moins 2 dates sont requis';
      this.cdr.markForCheck();
      return;
    }

    this.creating = true;
    this.error = null;
    this.cdr.markForCheck();

    try {
      const poll = await firstValueFrom(
        this.pollsService.createPoll({
          title: this.pollTitle,
          dates: this.selectedDates,
          groupId: this.groupId,
        })
      );
      this.pollCreated.emit(poll);
      this.resetForm();
      this.showCreateForm = false;
    } catch (error) {
      console.error('Error creating poll:', error);
      if (error instanceof HttpErrorResponse) {
        if (error.status === 403) {
          this.error = 'Vous devez être membre du groupe pour créer un sondage';
        } else if (error.status === 401) {
          this.error = 'Vous devez être connecté pour créer un sondage';
        } else {
          this.error = 'Erreur lors de la création du sondage';
        }
      } else {
        this.error = 'Erreur lors de la création du sondage';
      }
    } finally {
      this.creating = false;
      this.cdr.markForCheck();
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
    } finally {
      this.cdr.markForCheck();
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
    } finally {
      this.cdr.markForCheck();
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
    this.pollTitle = '';
    this.selectedDates = [];
    this.newDateInput = '';
    this.error = null;
  }
}
