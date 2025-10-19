import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ErrorMessageComponent } from '@org/ui';
import { AuthService } from '../../core/services/auth.service';
import {
  Group,
  GroupMemberSummary,
  GroupsService,
  LeaveGroupResponse,
} from '../../core/services/groups.service';
import { Poll, PollsService } from '../../core/services/polls.service';
import { PollWidgetComponent } from './poll-widget';

interface GroupMember extends GroupMemberSummary {
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
export class GroupDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private groupsService = inject(GroupsService);
  private pollsService = inject(PollsService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  group: GroupDetail | null = null;
  polls: Poll[] = [];
  activePoll: Poll | null = null;
  loading = true;
  error: string | null = null;
  isOffline = false;
  autoRetrySeconds: number | null = null;
  currentUserId: string | null = null;
  isMember = false;
  joinInProgress = false;
  joinError: string | null = null;
  leaveInProgress = false;
  leaveError: string | null = null;
  private currentGroupId: string | null = null;
  private autoRetryInterval: ReturnType<typeof setInterval> | null = null;
  private autoJoinRequested = false;
  private readonly autoRetryDelayMs = 15000;
  private readonly offlineHandler = () => {
    this.isOffline = true;
  };
  private readonly onlineHandler = () => {
    this.isOffline = false;
    if (!this.loading && this.error) {
      this.retryLoading();
    }
  };
  private pendingErrorBaseMessage: string | null = null;
  private initialPollsLoaded = false;
  readonly defaultErrorMessage =
    'Impossible de charger les détails du groupe. Veuillez réessayer.';

  ngOnInit(): void {
    // Récupérer l'utilisateur connecté
    this.currentUserId = this.authService.getCurrentUserId();
    this.isOffline =
      typeof navigator !== 'undefined' && navigator.onLine === false;
    window.addEventListener('offline', this.offlineHandler);
    window.addEventListener('online', this.onlineHandler);

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.currentGroupId = id;
      this.loadGroup(id);

      // Check if user should auto-join after login
      const autoJoin =
        this.route.snapshot.queryParamMap.get('autoJoin') === '1';
      if (autoJoin && this.authService.isAuthenticated()) {
        this.autoJoinRequested = true;
      }
    } else {
      this.error = 'ID de groupe invalide';
      this.loading = false;
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('offline', this.offlineHandler);
    window.removeEventListener('online', this.onlineHandler);
    this.clearAutoRetry();
  }

  private loadGroup(
    id: string,
    options: { refreshPolls?: boolean } = {}
  ): void {
    const { refreshPolls = false } = options;
    this.loading = true;
    this.error = null;
    this.pendingErrorBaseMessage = null;
    this.clearAutoRetry();
    this.joinInProgress = false;
    this.joinError = null;
    this.leaveInProgress = false;
    this.leaveError = null;

    this.groupsService.getGroup(id).subscribe({
      next: (data) => {
        this.group = data as GroupDetail;
        const isMemberFromApi =
          typeof data.currentUserIsMember === 'boolean'
            ? data.currentUserIsMember
            : this.group.members?.some((m) => m.userId === this.currentUserId);

        this.isMember = Boolean(isMemberFromApi);
        this.loading = false;
        this.error = null;
        this.isOffline = false;
        if (!this.initialPollsLoaded || refreshPolls) {
          this.initialPollsLoaded = true;
          this.loadPolls(id);
        }

        if (this.autoJoinRequested) {
          this.handlePendingAutoJoin();
        }

        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading group:', err);
        this.loading = false;
        this.handleGroupError(err);
        this.cdr.markForCheck();
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
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading polls:', err);
        this.cdr.markForCheck();
      },
    });
  }

  private loadPollDetails(pollId: string): void {
    this.pollsService.getPoll(pollId).subscribe({
      next: (poll) => {
        this.activePoll = poll;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading poll details:', err);
        this.cdr.markForCheck();
      },
    });
  }

  retryLoading(): void {
    if (!this.currentGroupId) {
      return;
    }

    this.clearAutoRetry();
    this.loadGroup(this.currentGroupId, { refreshPolls: true });
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
    return (
      !this.isMember && this.group?.isRecruiting === true && !this.isFull()
    );
  }

  private handlePendingAutoJoin(): void {
    if (!this.autoJoinRequested) {
      return;
    }

    if (!this.authService.isAuthenticated() || !this.group) {
      this.autoJoinRequested = false;
      this.clearAutoJoinQueryParam();
      return;
    }

    if (this.isMember || !this.canJoin() || this.joinInProgress) {
      this.autoJoinRequested = false;
      this.clearAutoJoinQueryParam();
      return;
    }

    this.autoJoinRequested = false;
    this.joinGroup();
    this.clearAutoJoinQueryParam();
  }

  private clearAutoJoinQueryParam(): void {
    const currentUrl = this.router.url;
    const cleanedUrl = currentUrl
      .replace(/([?&])autoJoin=1(&|$)/, (_, prefix: string, suffix: string) => {
        if (prefix === '?' && suffix === '&') {
          return '?';
        }

        if (suffix === '&') {
          return prefix;
        }

        return prefix === '?' ? '?' : '';
      })
      .replace(/\?$/, '')
      .replace(/&$/, '');

    if (cleanedUrl !== currentUrl) {
      setTimeout(() => {
        void this.router.navigateByUrl(cleanedUrl, {
          replaceUrl: true,
        });
      }, 0);
    }
  }

  joinGroup(): void {
    if (!this.authService.isAuthenticated()) {
      const returnUrl =
        this.router.url || `/groups/${this.currentGroupId ?? ''}`;
      const separator = returnUrl.includes('?') ? '&' : '?';
      const targetUrl = returnUrl.includes('autoJoin=1')
        ? returnUrl
        : `${returnUrl}${separator}autoJoin=1`;
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: targetUrl },
      });
      return;
    }

    if (!this.group || !this.canJoin() || this.joinInProgress) {
      return;
    }

    this.joinError = null;
    this.joinInProgress = true;

    const currentGroup = this.group;

    this.groupsService.joinGroup(currentGroup.id).subscribe({
      next: (response) => {
        this.joinInProgress = false;
        this.isMember = true;
        this.leaveError = null;

        const existingMembers = currentGroup.members ?? [];
        const alreadyPresent = existingMembers.some(
          (member) => member.userId === this.currentUserId
        );

        let updatedMembers = existingMembers;

        if (!alreadyPresent) {
          const currentUser = this.authService.getCurrentUser();
          const joinedAt = new Date().toISOString();
          const userId = currentUser?.id ?? this.currentUserId ?? '';

          if (userId) {
            const newMember: GroupMember = {
              userId,
              user: {
                id: userId,
                username: currentUser?.username ?? 'Vous',
                avatar: currentUser?.avatar ?? null,
              },
              joinedAt,
            };

            updatedMembers = [...existingMembers, newMember];
          }
        }

        const updatedGroup: GroupDetail = {
          ...currentGroup,
          members: updatedMembers,
          isRecruiting: response.isRecruiting,
          maxMembers: response.maxMembers ?? currentGroup.maxMembers ?? null,
          currentUserIsMember: true,
          _count: {
            members: response.memberCount,
          },
        };

        this.group = updatedGroup;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error joining group:', err);
        this.joinInProgress = false;
        this.joinError =
          err?.error?.message ??
          'Impossible de rejoindre le groupe pour le moment.';
        this.cdr.markForCheck();
      },
    });
  }

  leaveGroup(): void {
    if (!this.group || !this.isMember || this.leaveInProgress) {
      return;
    }

    const confirmed = window.confirm(
      'Êtes-vous sûr de vouloir quitter ce groupe ?'
    );

    if (!confirmed) {
      return;
    }

    this.leaveError = null;
    this.leaveInProgress = true;

    const currentGroup = this.group;

    this.groupsService.leaveGroup(currentGroup.id).subscribe({
      next: (response: LeaveGroupResponse) => {
        this.leaveInProgress = false;
        this.isMember = false;
        this.joinError = null;

        const remainingMembers = (currentGroup.members ?? []).filter(
          (member) => member.userId !== this.currentUserId
        );

        const updatedGroup: GroupDetail = {
          ...currentGroup,
          members: remainingMembers,
          isRecruiting: response.isRecruiting,
          maxMembers: response.maxMembers ?? currentGroup.maxMembers ?? null,
          currentUserIsMember: false,
          _count: {
            members: response.memberCount,
          },
        };

        this.group = updatedGroup;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error leaving group:', err);
        this.leaveInProgress = false;
        this.leaveError =
          err?.error?.message ??
          'Impossible de quitter le groupe pour le moment.';
        this.cdr.markForCheck();
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/groups']);
  }

  private handleGroupError(error: unknown): void {
    const httpError = error instanceof HttpErrorResponse ? error : null;

    if (this.detectOffline(httpError)) {
      this.error = 'Connexion perdue. Vérifiez votre réseau puis réessayez.';
      this.cdr.markForCheck();
      return;
    }

    const message = this.resolveServerMessage(httpError);
    this.error = message;

    if (httpError && this.shouldAutoRetry(httpError)) {
      this.scheduleAutoRetry(message);
    }
    this.cdr.markForCheck();
  }

  private detectOffline(error: HttpErrorResponse | null): boolean {
    const isOfflineError =
      (typeof navigator !== 'undefined' && navigator.onLine === false) ||
      error?.status === 0;

    if (isOfflineError) {
      this.isOffline = true;
      this.cdr.markForCheck();
      return true;
    }

    this.isOffline = false;
    this.cdr.markForCheck();
    return false;
  }

  private resolveServerMessage(httpError: HttpErrorResponse | null): string {
    if (!httpError) {
      return this.defaultErrorMessage;
    }

    switch (httpError.status) {
      case 401:
        if (this.authService.isAuthenticated()) {
          return 'Votre session a expiré. Veuillez vous reconnecter pour accéder au groupe.';
        }
        return 'Ce groupe est public, mais nous ne pouvons pas l’afficher pour le moment.';
      case 403:
        return "Vous n'avez pas accès à ce groupe.";
      case 404:
        return 'Ce groupe est introuvable ou n’existe plus.';
      case 429:
        return 'Trop de tentatives. Nous réessaierons automatiquement dans un instant.';
      case 503:
      case 504:
        return 'Nos serveurs sont momentanément indisponibles. Nous réessaierons automatiquement.';
      default:
        if (httpError.status >= 500) {
          return 'Une erreur est survenue sur nos serveurs. Réessayons dans un instant.';
        }
        if (httpError.status === 408) {
          return 'Le chargement est plus long que prévu. Patientez un instant ou réessayez.';
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
    this.cdr.markForCheck();

    this.autoRetryInterval = setInterval(() => {
      if (this.autoRetrySeconds === null) {
        return;
      }

      this.autoRetrySeconds -= 1;

      if (this.autoRetrySeconds <= 0) {
        this.clearAutoRetry();
        this.retryLoading();
      } else {
        this.error = this.composeErrorMessage();
      }
      this.cdr.markForCheck();
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
    this.cdr.markForCheck();
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
