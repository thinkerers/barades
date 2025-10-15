import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Poll, PollsService } from '../../core/services/polls.service';

@Component({
  selector: 'app-poll-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './poll-widget.html',
  styleUrl: './poll-widget.css'
})
export class PollWidgetComponent {
  private pollsService = inject(PollsService);

  @Input() poll: Poll | null = null;
  @Input() groupId = '';
  @Input() currentUserId = '';
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
  }

  addDate(): void {
    if (this.newDateInput && !this.selectedDates.includes(this.newDateInput)) {
      this.selectedDates.push(this.newDateInput);
      this.newDateInput = '';
    }
  }

  removeDate(date: string): void {
    this.selectedDates = this.selectedDates.filter(d => d !== date);
  }

  createPoll(): void {
    if (!this.pollTitle || this.selectedDates.length < 2) {
      this.error = 'Le titre et au moins 2 dates sont requis';
      return;
    }

    this.creating = true;
    this.error = null;

    this.pollsService.createPoll({
      title: this.pollTitle,
      dates: this.selectedDates,
      groupId: this.groupId
    }).subscribe({
      next: (poll) => {
        this.pollCreated.emit(poll);
        this.resetForm();
        this.showCreateForm = false;
        this.creating = false;
      },
      error: (err) => {
        console.error('Error creating poll:', err);
        this.error = 'Erreur lors de la création du sondage';
        this.creating = false;
      }
    });
  }

  vote(dateChoice: string): void {
    if (!this.poll) return;

    this.pollsService.vote(this.poll.id, {
      userId: this.currentUserId,
      dateChoice
    }).subscribe({
      next: () => {
        this.voted.emit();
      },
      error: (err) => {
        console.error('Error voting:', err);
      }
    });
  }

  removeMyVote(): void {
    if (!this.poll) return;

    this.pollsService.removeVote(this.poll.id, this.currentUserId).subscribe({
      next: () => {
        this.voted.emit();
      },
      error: (err) => {
        console.error('Error removing vote:', err);
      }
    });
  }

  getUserVote(): string | null {
    if (!this.poll || !this.poll.votes) return null;
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
      minute: '2-digit'
    }).format(date);
  }

  private resetForm(): void {
    this.pollTitle = '';
    this.selectedDates = [];
    this.newDateInput = '';
    this.error = null;
  }
}
