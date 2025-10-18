import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  AsyncStateComponent,
  AsyncStateStatus,
  GroupCardComponent,
} from '@org/ui';
import { AuthService } from '../../core/services/auth.service';
import {
  Group,
  GroupMemberSummary,
  GroupsService,
  JoinGroupResponse,
} from '../../core/services/groups.service';

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
  private authService = inject(AuthService);

  groups: Group[] = [];
  loading = true;
  error: string | null = null;
  private joiningGroups = new Set<string>();
  private joinedGroups = new Set<string>();
  private recentlyJoined = new Set<string>();
  private joinErrors = new Map<string, string>();
  private currentUserId: string | null = null;
  readonly defaultErrorMessage =
    'Impossible de charger les groupes. Veuillez réessayer.';

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId();
    this.loadGroups();
  }

  private loadGroups(): void {
    this.loading = true;
    this.error = null;

    this.groupsService.getGroups().subscribe({
      next: (data) => {
        this.groups = data;
        this.syncJoinedGroups(data);
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
    const groupId = group.id;

    if (this.isJoining(groupId) || this.hasJoined(groupId)) {
      return;
    }

    this.joinErrors.delete(groupId);
    this.joiningGroups.add(groupId);

    this.groupsService.joinGroup(groupId).subscribe({
      next: (response) => {
        this.joiningGroups.delete(groupId);
        this.joinedGroups.add(groupId);
        this.recentlyJoined.add(groupId);
        if (!this.currentUserId) {
          this.currentUserId = this.authService.getCurrentUserId();
        }
        this.updateLocalGroupState(groupId, response);
      },
      error: (err) => {
        console.error('Error joining group:', err);
        this.joiningGroups.delete(groupId);
        const message =
          err?.error?.message ??
          'Impossible de rejoindre le groupe pour le moment.';
        this.joinErrors.set(groupId, message);
      },
    });
  }

  isJoining(groupId: string): boolean {
    return this.joiningGroups.has(groupId);
  }

  hasJoined(groupId: string): boolean {
    return this.joinedGroups.has(groupId);
  }

  isRecentlyJoined(groupId: string): boolean {
    return this.recentlyJoined.has(groupId);
  }

  getJoinError(groupId: string): string | null {
    return this.joinErrors.get(groupId) ?? null;
  }

  private updateLocalGroupState(
    groupId: string,
    response: JoinGroupResponse
  ): void {
    this.groups = this.groups.map((existing) => {
      if (existing.id !== groupId) {
        return existing;
      }

      const maxMembers = response.maxMembers ?? existing.maxMembers ?? null;
      const members = existing.members ?? [];
      const userId = this.currentUserId;
      let updatedMembers: GroupMemberSummary[] = members;

      if (userId && !members.some((member) => member.userId === userId)) {
        const currentUser = this.authService.getCurrentUser();
        updatedMembers = [
          ...members,
          {
            userId,
            user: currentUser
              ? {
                  id: currentUser.id,
                  username: currentUser.username,
                  avatar: currentUser.avatar ?? null,
                }
              : members.find((member) => member.userId === userId)?.user ??
                null,
          },
        ];
      }

      return {
        ...existing,
        isRecruiting: response.isRecruiting,
        maxMembers,
        members: updatedMembers,
        _count: {
          members: response.memberCount,
        },
      };
    });
  }

  private syncJoinedGroups(groups: Group[]): void {
    if (!this.currentUserId) {
      return;
    }

    groups.forEach((group) => {
      if (
        group.members?.some((member) => member.userId === this.currentUserId)
      ) {
        this.joinedGroups.add(group.id);
      }
    });
  }
}
