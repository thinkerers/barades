import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  AsyncStateComponent,
  AsyncStateStatus,
  GroupCardComponent,
} from '@org/ui';
import { Group, GroupsService } from '../../core/services/groups.service';

@Component({
  selector: 'app-groups-list',
  standalone: true,
  imports: [CommonModule, GroupCardComponent, AsyncStateComponent],
  templateUrl: './groups-list.html',
  styleUrl: './groups-list.css',
})
export class GroupsListComponent implements OnInit {
  private groupsService = inject(GroupsService);
  private router = inject(Router);

  groups: Group[] = [];
  loading = true;
  error: string | null = null;
  readonly defaultErrorMessage =
    'Impossible de charger les groupes. Veuillez réessayer.';

  ngOnInit(): void {
    this.loadGroups();
  }

  private loadGroups(): void {
    this.loading = true;
    this.error = null;

    this.groupsService.getGroups().subscribe({
      next: (data) => {
        this.groups = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading groups:', err);
        this.error = this.defaultErrorMessage;
        this.loading = false;
      },
    });
  }

  retry(): void {
    this.loadGroups();
  }

  get groupsState(): AsyncStateStatus {
    if (this.loading) {
      return 'loading';
    }

    if (this.error) {
      return 'error';
    }

    return 'ready';
  }

  viewGroupDetails(groupId: string): void {
    void this.router.navigate(['/groups', groupId]);
  }

  requestToJoin(group: Group): void {
    console.info('Group join action requested', group);
  }
}
