import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  PendingTasks,
  WritableSignal,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  AsyncStateComponent,
  AsyncStateStatus,
  GroupCardComponent,
} from '@org/ui';
import { EmptyError, Subject, firstValueFrom, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupsListComponent implements OnInit {
  private readonly groupsService = inject(GroupsService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly pendingTasks = inject(PendingTasks);
  readonly groups = signal<Group[]>([]);
  readonly loading = signal<boolean>(false);
  readonly refreshing = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly isOffline = signal<boolean>(false);
  readonly autoRetrySeconds = signal<number | null>(null);
  private readonly joiningGroups = signal(new Set<string>());
  private readonly joinedGroups = signal(new Set<string>());
  private readonly recentlyJoined = signal(new Set<string>());
  private readonly joinErrors = signal(new Map<string, string>());
  private currentUserId: string | null = null;
  private autoRetryCancel: (() => void) | null = null;
  private readonly autoRetryDelayMs = 15000;
  private readonly offlineHandler = () => {
    this.isOffline.set(true);
  };
  private readonly onlineHandler = () => {
    this.isOffline.set(false);
    if (!this.loading() && (this.error() || this.groups().length === 0)) {
      this.retry();
    }
  };
  private pendingErrorBaseMessage: string | null = null;
  readonly defaultErrorMessage =
    'Impossible de charger les groupes. Veuillez réessayer.';

  readonly groupsState = computed<AsyncStateStatus>(() => {
    if (this.loading()) {
      return 'loading';
    }

    if (this.error()) {
      return 'error';
    }

    return 'ready';
  });

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('offline', this.offlineHandler);
        window.removeEventListener('online', this.onlineHandler);
      }
      this.clearAutoRetry();
    });
  }

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId();
    if (typeof navigator !== 'undefined') {
      this.isOffline.set(navigator.onLine === false);
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('offline', this.offlineHandler);
      window.addEventListener('online', this.onlineHandler);
    }
    void this.loadGroups();
  }

  private async loadGroups(): Promise<void> {
    this.error.set(null);
    this.pendingErrorBaseMessage = null;
    this.clearAutoRetry();

    const cachedGroups = this.groupsService.getCachedGroupsSnapshot();
    const hasCachedData =
      Array.isArray(cachedGroups) && cachedGroups.length > 0;

    if (hasCachedData && cachedGroups) {
      this.groups.set(cachedGroups);
      this.syncJoinedGroups(cachedGroups);
    }

    this.loading.set(!hasCachedData);
    this.refreshing.set(hasCachedData);

    await this.pendingTasks.run(async () => {
      try {
        const data = await firstValueFrom(this.groupsService.getGroups());
        this.groups.set(data);
        this.syncJoinedGroups(data);
        this.error.set(null);
        this.isOffline.set(false);
      } catch (err) {
        console.error('Error loading groups:', err);

        if (!hasCachedData) {
          this.handleLoadError(err);
        } else {
          const httpError = err instanceof HttpErrorResponse ? err : null;
          this.detectOffline(httpError);
        }
      } finally {
        this.loading.set(false);
        this.refreshing.set(false);
      }
    });
  }

  retry(): void {
    this.clearAutoRetry();
    void this.loadGroups();
  }

  viewGroupDetails(groupId: string): void {
    void this.router.navigate(['/groups', groupId]);
  }

  async requestToJoin(group: Group): Promise<void> {
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

    this.updateJoinErrors((map) => map.delete(groupId));
    this.updateSet(this.joiningGroups, (set) => set.add(groupId));

    try {
      await this.attemptJoin(group, true);
    } finally {
      this.updateSet(this.joiningGroups, (set) => set.delete(groupId));
    }
  }

  isJoining(groupId: string): boolean {
    return this.joiningGroups().has(groupId);
  }

  private async attemptJoin(group: Group, allowRetry: boolean): Promise<void> {
    const groupId = group.id;

    try {
      const response = await firstValueFrom(
        this.groupsService.joinGroup(groupId)
      );
      this.updateJoinErrors((map) => map.delete(groupId));
      this.updateSet(this.joinedGroups, (set) => set.add(groupId));
      this.updateSet(this.recentlyJoined, (set) => set.add(groupId));
      group.currentUserIsMember = true;
      if (!this.currentUserId) {
        this.currentUserId = this.authService.getCurrentUserId();
      }
      this.updateLocalGroupState(groupId, response);
    } catch (error) {
      if (
        error instanceof HttpErrorResponse &&
        error.status === 409 &&
        allowRetry
      ) {
        await this.attemptJoin(group, false);
        return;
      }

      console.error('Error joining group:', error);
      const message =
        error instanceof HttpErrorResponse && error.error?.message
          ? error.error.message
          : 'Impossible de rejoindre le groupe pour le moment.';
      this.updateJoinErrors((map) => map.set(groupId, message));
      this.updateSet(this.joinedGroups, (set) => set.delete(groupId));
      this.updateSet(this.recentlyJoined, (set) => set.delete(groupId));
    }
  }

  hasJoined(groupId: string): boolean {
    return this.joinedGroups().has(groupId);
  }

  isRecentlyJoined(groupId: string): boolean {
    return this.recentlyJoined().has(groupId);
  }

  getJoinError(groupId: string): string | null {
    return this.joinErrors().get(groupId) ?? null;
  }

  private updateLocalGroupState(
    groupId: string,
    response: JoinGroupResponse
  ): void {
    this.groups.update((existingGroups) =>
      existingGroups.map((existing) => {
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
      })
    );
  }

  private syncJoinedGroups(groups: Group[]): void {
    if (!this.currentUserId) {
      return;
    }

    const joined = new Set<string>();

    groups.forEach((group) => {
      if (group.currentUserIsMember === true) {
        joined.add(group.id);
      }
    });

    this.joinedGroups.set(joined);
  }

  private handleLoadError(error: unknown): void {
    const httpError = error instanceof HttpErrorResponse ? error : null;

    if (this.detectOffline(httpError)) {
      this.error.set(
        'Erreur de connexion. Vérifiez votre réseau puis réessayez.'
      );
      return;
    }

    const message = this.resolveServerMessage(httpError);
    this.error.set(message);

    if (httpError && this.shouldAutoRetry(httpError)) {
      this.scheduleAutoRetry(message);
    }
  }

  private detectOffline(error: HttpErrorResponse | null): boolean {
    const isOfflineError =
      (typeof navigator !== 'undefined' && navigator.onLine === false) ||
      error?.status === 0;

    if (isOfflineError) {
      this.isOffline.set(true);
      return true;
    }

    this.isOffline.set(false);
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
    const totalSeconds = Math.ceil(this.autoRetryDelayMs / 1000);
    const cancel$ = new Subject<void>();
    let cancelled = false;

    const cancel = () => {
      if (cancelled) {
        return;
      }

      cancelled = true;
      if (!cancel$.closed) {
        cancel$.next();
        cancel$.complete();
      }
    };

    this.autoRetryCancel = cancel;

    const waitForNextSecond = async (): Promise<boolean> => {
      try {
        await firstValueFrom(timer(1000).pipe(takeUntil(cancel$)));
        return true;
      } catch (error) {
        if (error instanceof EmptyError) {
          return false;
        }
        throw error;
      }
    };

    void this.pendingTasks.run(async () => {
      try {
        for (let remaining = totalSeconds; remaining > 0; remaining--) {
          if (cancelled) {
            break;
          }

          this.autoRetrySeconds.set(remaining);
          this.error.set(this.composeErrorMessage());

          if (remaining <= 1) {
            break;
          }

          const tickCompleted = await waitForNextSecond();
          if (!tickCompleted) {
            cancelled = true;
            break;
          }
        }
      } finally {
        if (!cancel$.closed) {
          cancel$.complete();
        }
      }

      if (cancelled) {
        return;
      }

      this.autoRetrySeconds.set(null);
      this.pendingErrorBaseMessage = null;
      this.retry();
    });
  }

  private composeErrorMessage(): string {
    if (!this.pendingErrorBaseMessage) {
      return this.error() ?? this.defaultErrorMessage;
    }

    const seconds = this.autoRetrySeconds();

    if (seconds === null) {
      return this.pendingErrorBaseMessage;
    }

    return `${this.pendingErrorBaseMessage} Nouvelle tentative dans ${seconds} s.`;
  }

  private clearAutoRetry(): void {
    if (this.autoRetryCancel) {
      const cancel = this.autoRetryCancel;
      this.autoRetryCancel = null;
      cancel();
    }
    this.autoRetrySeconds.set(null);
    this.pendingErrorBaseMessage = null;
  }

  private updateSet(
    target: WritableSignal<Set<string>>,
    mutate: (set: Set<string>) => void
  ): void {
    target.update((current) => {
      const next = new Set(current);
      mutate(next);
      return next;
    });
  }

  private updateJoinErrors(mutate: (map: Map<string, string>) => void): void {
    this.joinErrors.update((current) => {
      const next = new Map(current);
      mutate(next);
      return next;
    });
  }
}
