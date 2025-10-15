import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GroupsService, Group } from '../../core/services/groups.service';

interface GroupMember {
  id: string;
  username: string;
  avatar: string | null;
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
  imports: [CommonModule, RouterLink],
  templateUrl: './group-detail.html',
  styleUrl: './group-detail.css'
})
export class GroupDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private groupsService = inject(GroupsService);

  group: GroupDetail | null = null;
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadGroup(id);
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
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading group:', err);
        this.error = 'Impossible de charger les détails du groupe.';
        this.loading = false;
      }
    });
  }

  getPlaystyleLabel(playstyle: string): string {
    const labels: Record<string, string> = {
      'COMPETITIVE': 'Compétitif',
      'CASUAL': 'Décontracté',
      'STORY_DRIVEN': 'Narratif',
      'SANDBOX': 'Bac à sable'
    };
    return labels[playstyle] || playstyle;
  }

  getPlaystyleColor(playstyle: string): string {
    const colors: Record<string, string> = {
      'COMPETITIVE': 'red',
      'CASUAL': 'green',
      'STORY_DRIVEN': 'purple',
      'SANDBOX': 'blue'
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
      year: 'numeric'
    }).format(date);
  }

  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-BE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }
}
