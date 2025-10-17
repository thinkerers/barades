import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ErrorMessageComponent } from '@org/ui';
import { AuthService } from '../../core/services/auth.service';
import { Group, GroupsService } from '../../core/services/groups.service';
import { Poll, PollsService } from '../../core/services/polls.service';
import { PollWidgetComponent } from './poll-widget';

interface GroupMember {
  userId: string;
  user: {
    id: string;
    username: string;
    avatar: string | null;
  };
  joinedAt: string;
}

interface GroupSession {
  id: string;
  title: string;
  scheduledFor: string;
  location: {
    id: string;
    name: string;
  };
  _count?: {
    reservations: number;
  };
}

interface GroupDetail extends Group {
  members?: GroupMember[];
  sessions?: GroupSession[];
}

@Component({
  selector: 'app-group-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    PollWidgetComponent,
    ErrorMessageComponent,
  ],
  templateUrl: './group-detail.html',
  styleUrl: './group-detail.css',
})
export class GroupDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private groupsService = inject(GroupsService);
  private pollsService = inject(PollsService);
  private authService = inject(AuthService);

  group: GroupDetail | null = null;
  polls: Poll[] = [];
  activePoll: Poll | null = null;
  loading = true;
  error: string | null = null;
  currentUserId: string | null = null;
  isMember = false;

  ngOnInit(): void {
    // Récupérer l'utilisateur connecté
    this.currentUserId = this.authService.getCurrentUserId();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadGroup(id);
      this.loadPolls(id);
    } else {
      this.error = 'ID de groupe invalide';
      this.loading = false;
    }
  }

  private loadGroup(id: string): void {
    this.loading = true;
    this.error = null;

    this.groupsService.getGroup(id).subscribe({
      next: (data) => {
        this.group = data as GroupDetail;
        // Vérifier si l'utilisateur est membre (comparer avec userId)
        this.isMember =
          this.group.members?.some((m) => m.userId === this.currentUserId) ||
          false;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading group:', err);
        this.error = 'Impossible de charger les détails du groupe.';
        this.loading = false;
      },
    });
  }

  private loadPolls(groupId: string): void {
    this.pollsService.getPolls(groupId).subscribe({
      next: (polls) => {
        this.polls = polls;
        if (polls.length > 0) {
          // Load full details for the most recent poll
          this.loadPollDetails(polls[0].id);
        }
      },
      error: (err) => {
        console.error('Error loading polls:', err);
      },
    });
  }

  private loadPollDetails(pollId: string): void {
    this.pollsService.getPoll(pollId).subscribe({
      next: (poll) => {
        this.activePoll = poll;
      },
      error: (err) => {
        console.error('Error loading poll details:', err);
      },
    });
  }

  onPollCreated(poll: Poll): void {
    this.polls = [poll, ...this.polls];
    this.loadPollDetails(poll.id);
  }

  onVoted(): void {
    if (this.activePoll) {
      this.loadPollDetails(this.activePoll.id);
    }
  }

  getPlaystyleLabel(playstyle: string): string {
    const labels: Record<string, string> = {
      COMPETITIVE: 'Compétitif',
      CASUAL: 'Décontracté',
      STORY_DRIVEN: 'Narratif',
      SANDBOX: 'Bac à sable',
    };
    return labels[playstyle] || playstyle;
  }

  getPlaystyleColor(playstyle: string): string {
    const colors: Record<string, string> = {
      COMPETITIVE: 'red',
      CASUAL: 'green',
      STORY_DRIVEN: 'purple',
      SANDBOX: 'blue',
    };
    return colors[playstyle] || 'gray';
  }

  getMemberCount(): number {
    return this.group?.members?.length || this.group?._count?.members || 0;
  }

  isFull(): boolean {
    if (!this.group?.maxMembers) return false;
    return this.getMemberCount() >= this.group.maxMembers;
  }

  canJoin(): boolean {
    return this.group?.isRecruiting === true && !this.isFull();
  }

  joinGroup(): void {
    if (!this.canJoin()) return;
    console.log('Join group functionality to be implemented');
    // TODO: Implement join group API call
  }

  leaveGroup(): void {
    console.log('Leave group functionality to be implemented');
    // TODO: Implement leave group API call
  }

  goBack(): void {
    this.router.navigate(['/groups']);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-BE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  }

  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-BE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }
}
