import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
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

  createPoll(): void {
    if (!this.pollTitle || this.selectedDates.length < 2) {
      this.error = 'Le titre et au moins 2 dates sont requis';
      this.cdr.markForCheck();
      return;
    }

    this.creating = true;
    this.error = null;
    this.cdr.markForCheck();

    this.pollsService
      .createPoll({
        title: this.pollTitle,
        dates: this.selectedDates,
        groupId: this.groupId,
      })
      .subscribe({
        next: (poll) => {
          this.pollCreated.emit(poll);
          this.resetForm();
          this.showCreateForm = false;
          this.creating = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error creating poll:', err);
          if (err.status === 403) {
            this.error =
              'Vous devez être membre du groupe pour créer un sondage';
          } else if (err.status === 401) {
            this.error = 'Vous devez être connecté pour créer un sondage';
          } else {
            this.error = 'Erreur lors de la création du sondage';
          }
          this.creating = false;
          this.cdr.markForCheck();
        },
      });
  }

  vote(dateChoice: string): void {
    if (!this.poll || !this.currentUserId) return;

    this.pollsService
      .vote(this.poll.id, {
        userId: this.currentUserId,
        dateChoice,
      })
      .subscribe({
        next: () => {
          this.voted.emit();
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error voting:', err);
          if (err.status === 403) {
            this.notifications.error(
              'Vous devez être membre du groupe pour voter.'
            );
          } else if (err.status === 401) {
            this.notifications.error('Vous devez être connecté pour voter.');
          } else {
            this.notifications.error('Erreur lors du vote.');
          }
          this.cdr.markForCheck();
        },
      });
  }

  removeMyVote(): void {
    if (!this.poll || !this.currentUserId) return;

    this.pollsService.removeVote(this.poll.id, this.currentUserId).subscribe({
      next: () => {
        this.voted.emit();
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error removing vote:', err);
        if (err.status === 403) {
          this.notifications.error(
            'Vous devez être membre du groupe pour supprimer votre vote.'
          );
        } else if (err.status === 401) {
          this.notifications.error(
            'Vous devez être connecté pour supprimer votre vote.'
          );
        } else {
          this.notifications.error('Erreur lors de la suppression du vote.');
        }
        this.cdr.markForCheck();
      },
    });
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
