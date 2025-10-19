import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
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
  imports: [GroupCardComponent, AsyncStateComponent],
  templateUrl: './groups-list.html',
  styleUrl: './groups-list.css',
})
export class GroupsListComponent implements OnInit, OnDestroy {
  private groupsService = inject(GroupsService);
  private router = inject(Router);
  private authService = inject(AuthService);

  groups: Group[] = [];
  loading = true;
  error: string | null = null;
  isOffline = false;
  autoRetrySeconds: number | null = null;
  private joiningGroups = new Set<string>();
  private joinedGroups = new Set<string>();
  private recentlyJoined = new Set<string>();
  private joinErrors = new Map<string, string>();
  private currentUserId: string | null = null;
  private autoRetryInterval: ReturnType<typeof setInterval> | null = null;
  private readonly autoRetryDelayMs = 15000;
  private readonly offlineHandler = () => {
    this.isOffline = true;
  };
  private readonly onlineHandler = () => {
    this.isOffline = false;
    if (!this.loading && (this.error || this.groups.length === 0)) {
      this.retry();
    }
  };
  private pendingErrorBaseMessage: string | null = null;
  readonly defaultErrorMessage =
    'Impossible de charger les groupes. Veuillez réessayer.';

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId();
    this.isOffline =
      typeof navigator !== 'undefined' && navigator.onLine === false;
    window.addEventListener('offline', this.offlineHandler);
    window.addEventListener('online', this.onlineHandler);
    this.loadGroups();
  }

  ngOnDestroy(): void {
    window.removeEventListener('offline', this.offlineHandler);
    window.removeEventListener('online', this.onlineHandler);
    this.clearAutoRetry();
  }

  private loadGroups(): void {
    this.loading = true;
    this.error = null;
    this.pendingErrorBaseMessage = null;
    this.clearAutoRetry();

    this.groupsService.getGroups().subscribe({
      next: (data) => {
        this.groups = data;
        this.syncJoinedGroups(data);
        this.loading = false;
        this.error = null;
        this.isOffline = false;
      },
      error: (err) => {
        console.error('Error loading groups:', err);
        this.loading = false;
        this.handleLoadError(err);
      },
    });
  }

  retry(): void {
    this.clearAutoRetry();
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

    if (
      this.isJoining(groupId) ||
      this.hasJoined(groupId) ||
      group.currentUserIsMember
    ) {
      return;
    }

    if (!this.authService.isAuthenticated()) {
      const returnUrl = `/groups/${groupId}?autoJoin=1`;
      void this.router.navigate(['/login'], {
        queryParams: { returnUrl },
      });
      return;
    }

    this.joinErrors.delete(groupId);
    this.joiningGroups.add(groupId);

    this.groupsService.joinGroup(groupId).subscribe({
      next: (response) => {
        this.joiningGroups.delete(groupId);
        this.joinedGroups.add(groupId);
        this.recentlyJoined.add(groupId);
        group.currentUserIsMember = true;
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
        currentUserIsMember: true,
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
      if (group.currentUserIsMember === true) {
        this.joinedGroups.add(group.id);
      } else {
        this.joinedGroups.delete(group.id);
      }
    });
  }

  private handleLoadError(error: unknown): void {
    const httpError = error instanceof HttpErrorResponse ? error : null;

    if (this.detectOffline(httpError)) {
      this.error = 'Erreur de connexion. Vérifiez votre réseau puis réessayez.';
      return;
    }

    const message = this.resolveServerMessage(httpError);
    this.error = message;

    if (httpError && this.shouldAutoRetry(httpError)) {
      this.scheduleAutoRetry(message);
    }
  }

  private detectOffline(error: HttpErrorResponse | null): boolean {
    const isOfflineError =
      (typeof navigator !== 'undefined' && navigator.onLine === false) ||
      error?.status === 0;

    if (isOfflineError) {
      this.isOffline = true;
      return true;
    }

    this.isOffline = false;
    return false;
  }

  private resolveServerMessage(httpError: HttpErrorResponse | null): string {
    if (!httpError) {
      return this.defaultErrorMessage;
    }

    switch (httpError.status) {
      case 401:
        if (this.authService.isAuthenticated()) {
          return 'Votre session a expiré. Veuillez vous reconnecter pour voir les groupes.';
        }
        return 'Nous ne pouvons pas afficher les groupes publics pour le moment. Réessayez plus tard.';
      case 403:
        return "Vous n'avez pas l'autorisation de consulter ces groupes.";
      case 404:
        return 'Aucun groupe disponible pour le moment.';
      case 429:
        return 'Trop de tentatives. Veuillez patienter quelques instants avant de réessayer.';
      case 503:
      case 504:
        return 'Nos serveurs sont momentanément indisponibles. Nous réessaierons automatiquement.';
      default:
        if (httpError.status >= 500) {
          return 'Une erreur serveur est survenue. Merci de réessayer dans un instant.';
        }
        if (httpError.status === 408) {
          return 'La requête est plus longue que prévu. Vérifiez votre connexion puis réessayez.';
        }
    }

    if (httpError.error?.message) {
      return httpError.error.message;
    }

    return this.defaultErrorMessage;
  }

  private shouldAutoRetry(error: HttpErrorResponse): boolean {
    if (error.status === 429) {
      return true;
    }

    if (error.status >= 500 || error.status === 503 || error.status === 504) {
      return true;
    }

    return false;
  }

  private scheduleAutoRetry(baseMessage: string): void {
    this.clearAutoRetry();
    this.pendingErrorBaseMessage = baseMessage;
    this.autoRetrySeconds = Math.ceil(this.autoRetryDelayMs / 1000);
    this.error = this.composeErrorMessage();

    this.autoRetryInterval = setInterval(() => {
      if (this.autoRetrySeconds === null) {
        return;
      }

      this.autoRetrySeconds -= 1;

      if (this.autoRetrySeconds <= 0) {
        this.clearAutoRetry();
        this.loadGroups();
      } else {
        this.error = this.composeErrorMessage();
      }
    }, 1000);
  }

  private composeErrorMessage(): string {
    if (!this.pendingErrorBaseMessage) {
      return this.error ?? this.defaultErrorMessage;
    }

    if (this.autoRetrySeconds === null) {
      return this.pendingErrorBaseMessage;
    }

    return `${this.pendingErrorBaseMessage} Nouvelle tentative dans ${this.autoRetrySeconds} s.`;
  }

  private clearAutoRetry(): void {
    if (this.autoRetryInterval) {
      clearInterval(this.autoRetryInterval);
      this.autoRetryInterval = null;
    }
    this.autoRetrySeconds = null;
    this.pendingErrorBaseMessage = null;
  }
}
