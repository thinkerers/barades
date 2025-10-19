import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ErrorMessageComponent } from '@org/ui';
import { firstValueFrom, Subscription, timer } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import {
  Group,
  GroupMemberSummary,
  GroupsService,
  JoinGroupResponse,
  LeaveGroupResponse,
} from '../../core/services/groups.service';
import { Poll, PollsService } from '../../core/services/polls.service';
import { PollWidgetComponent } from './poll-widget';

type CountdownSubscription = Subscription | null;

type AutoRetryState = {
  baseMessage: string;
  countdownSeconds: WritableSignal<number | null>;
  subscription: CountdownSubscription;
};

type GroupMember = GroupMemberSummary & {
  user: {
    id: string;
    username: string;
    avatar: string | null;
  };
  joinedAt: string;
};

type GroupSession = {
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
};

type GroupDetail = Omit<Group, 'members'> & {
  members?: GroupMember[];
  sessions?: GroupSession[];
};

@Component({
  selector: 'app-group-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    PollWidgetComponent,
    ErrorMessageComponent,
    MatIconModule,
  ],
  templateUrl: './group-detail.html',
  styleUrl: './group-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private groupsService = inject(GroupsService);
  private pollsService = inject(PollsService);
  private authService = inject(AuthService);

  readonly group = signal<GroupDetail | null>(null);
  readonly polls = signal<Poll[]>([]);
  readonly activePoll = signal<Poll | null>(null);
  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);
  readonly isOffline = signal<boolean>(false);
  readonly autoRetrySeconds = signal<number | null>(null);
  readonly isMember = signal<boolean>(false);
  readonly joinInProgress = signal<boolean>(false);
  readonly joinError = signal<string | null>(null);
  readonly leaveInProgress = signal<boolean>(false);
  readonly leaveError = signal<string | null>(null);
  readonly memberCount = computed(() => {
    const group = this.group();
    return group?.members?.length ?? group?._count?.members ?? 0;
  });
  readonly isFull = computed(() => {
    const group = this.group();
    if (!group?.maxMembers) {
      return false;
    }
    return this.memberCount() >= group.maxMembers;
  });
  readonly canJoin = computed(() => {
    const group = this.group();
    return !this.isMember() && group?.isRecruiting === true && !this.isFull();
  });

  currentUserId: string | null = null;
  readonly defaultErrorMessage =
    'Impossible de charger les détails du groupe. Veuillez réessayer.';

  private currentGroupId: string | null = null;
  private autoJoinRequested = false;
  private readonly autoRetryDelayMs = 15000;
  private readonly offlineHandler = () => {
    this.isOffline.set(true);
  };
  private readonly onlineHandler = () => {
    this.isOffline.set(false);
    if (!this.loading() && this.error()) {
      this.retryLoading();
    }
  };
  private autoRetryState: AutoRetryState | null = null;
  private initialPollsLoaded = false;

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId();
    if (typeof navigator !== 'undefined') {
      this.isOffline.set(navigator.onLine === false);
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('offline', this.offlineHandler);
      window.addEventListener('online', this.onlineHandler);
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.currentGroupId = id;
      void this.loadGroup(id);

      const autoJoin =
        this.route.snapshot.queryParamMap.get('autoJoin') === '1';
      if (autoJoin && this.authService.isAuthenticated()) {
        this.autoJoinRequested = true;
      }
    } else {
      this.error.set('ID de groupe invalide');
      this.loading.set(false);
    }
  }

  ngOnDestroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('offline', this.offlineHandler);
      window.removeEventListener('online', this.onlineHandler);
    }
    this.clearAutoRetry();
  }

  private async loadGroup(
    id: string,
    options: { refreshPolls?: boolean } = {}
  ): Promise<void> {
    const { refreshPolls = false } = options;
    this.loading.set(true);
    this.error.set(null);
    this.autoRetrySeconds.set(null);
    this.clearAutoRetry();
    this.joinInProgress.set(false);
    this.joinError.set(null);
    this.leaveInProgress.set(false);
    this.leaveError.set(null);

    try {
      const data = (await firstValueFrom(
        this.groupsService.getGroup(id)
      )) as GroupDetail;

      const isMemberFromApi =
        typeof data.currentUserIsMember === 'boolean'
          ? data.currentUserIsMember
          : data.members?.some((m) => m.userId === this.currentUserId);

      this.group.set(data);
      this.isMember.set(Boolean(isMemberFromApi));
      this.loading.set(false);
      this.error.set(null);
      this.isOffline.set(false);

      if (!this.initialPollsLoaded || refreshPolls) {
        this.initialPollsLoaded = true;
        await this.loadPolls(id);
      }

      if (this.autoJoinRequested) {
        this.handlePendingAutoJoin();
      }
    } catch (err) {
      this.loading.set(false);
      this.handleGroupError(err);
    }
  }

  private async loadPolls(groupId: string): Promise<void> {
    try {
      const polls = await firstValueFrom(this.pollsService.getPolls(groupId));
      this.polls.set(polls);
      if (polls.length > 0) {
        await this.loadPollDetails(polls[0].id);
      } else {
        this.activePoll.set(null);
      }
    } catch (err) {
      console.error('Error loading polls:', err);
    }
  }

  private async loadPollDetails(pollId: string): Promise<void> {
    try {
      const poll = await firstValueFrom(this.pollsService.getPoll(pollId));
      this.activePoll.set(poll);
    } catch (err) {
      console.error('Error loading poll details:', err);
    }
  }

  retryLoading(): void {
    if (!this.currentGroupId) {
      return;
    }

    this.clearAutoRetry();
    void this.loadGroup(this.currentGroupId, { refreshPolls: true });
  }

  onPollCreated(poll: Poll): void {
    this.polls.update((current) => [poll, ...current]);
    void this.loadPollDetails(poll.id);
  }

  onVoted(): void {
    const activePoll = this.activePoll();
    if (activePoll) {
      void this.loadPollDetails(activePoll.id);
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

  private handlePendingAutoJoin(): void {
    if (!this.autoJoinRequested) {
      return;
    }

    if (!this.authService.isAuthenticated() || !this.group()) {
      this.autoJoinRequested = false;
      this.clearAutoJoinQueryParam();
      return;
    }

    if (this.isMember() || !this.canJoin() || this.joinInProgress()) {
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
      afterNextRender(() => {
        void this.router.navigateByUrl(cleanedUrl, {
          replaceUrl: true,
        });
      });
    }
  }

  async joinGroup(): Promise<void> {
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

    const group = this.group();
    if (!group || !this.canJoin() || this.joinInProgress()) {
      return;
    }

    this.joinError.set(null);
    this.joinInProgress.set(true);

    try {
      const response: JoinGroupResponse = await firstValueFrom(
        this.groupsService.joinGroup(group.id)
      );

      this.joinInProgress.set(false);
      this.isMember.set(true);
      this.leaveError.set(null);

      const existingMembers = group.members ?? [];
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
        ...group,
        members: updatedMembers,
        isRecruiting: response.isRecruiting,
        maxMembers: response.maxMembers ?? group.maxMembers ?? null,
        currentUserIsMember: true,
        _count: {
          members: response.memberCount,
        },
      };

      this.group.set(updatedGroup);
    } catch (err) {
      console.error('Error joining group:', err);
      this.joinInProgress.set(false);
      const httpError = err as HttpErrorResponse;
      this.joinError.set(
        httpError?.error?.message ??
          'Impossible de rejoindre le groupe pour le moment.'
      );
    }
  }

  async leaveGroup(): Promise<void> {
    const group = this.group();
    if (!group || !this.isMember() || this.leaveInProgress()) {
      return;
    }

    const confirmed =
      typeof window === 'undefined'
        ? true
        : window.confirm('Êtes-vous sûr de vouloir quitter ce groupe ?');

    if (!confirmed) {
      return;
    }

    this.leaveError.set(null);
    this.leaveInProgress.set(true);

    try {
      const response: LeaveGroupResponse = await firstValueFrom(
        this.groupsService.leaveGroup(group.id)
      );

      this.leaveInProgress.set(false);
      this.isMember.set(false);
      this.joinError.set(null);

      const remainingMembers = (group.members ?? []).filter(
        (member) => member.userId !== this.currentUserId
      );

      const updatedGroup: GroupDetail = {
        ...group,
        members: remainingMembers,
        isRecruiting: response.isRecruiting,
        maxMembers: response.maxMembers ?? group.maxMembers ?? null,
        currentUserIsMember: false,
        _count: {
          members: response.memberCount,
        },
      };

      this.group.set(updatedGroup);
    } catch (err) {
      console.error('Error leaving group:', err);
      this.leaveInProgress.set(false);
      const httpError = err as HttpErrorResponse;
      this.leaveError.set(
        httpError?.error?.message ??
          'Impossible de quitter le groupe pour le moment.'
      );
    }
  }

  goBack(): void {
    this.router.navigate(['/groups']);
  }

  private handleGroupError(error: unknown): void {
    const httpError = error instanceof HttpErrorResponse ? error : null;

    if (this.detectOffline(httpError)) {
      this.error.set('Connexion perdue. Vérifiez votre réseau puis réessayez.');
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

    const countdownSeconds = signal<number | null>(
      Math.ceil(this.autoRetryDelayMs / 1000)
    );

    this.autoRetryState = {
      baseMessage,
      countdownSeconds,
      subscription: timer(1000, 1000).subscribe(() => {
        const remaining = countdownSeconds();
        if (remaining === null) {
          return;
        }

        const nextValue = remaining - 1;
        if (nextValue <= 0) {
          this.clearAutoRetry();
          this.retryLoading();
          return;
        }

        countdownSeconds.set(nextValue);
        this.error.set(this.composeErrorMessage(baseMessage, nextValue));
      }),
    };

    this.autoRetrySeconds.set(countdownSeconds());
    this.error.set(
      this.composeErrorMessage(baseMessage, countdownSeconds() ?? null)
    );
  }

  private composeErrorMessage(
    baseMessage: string,
    remainingSeconds: number | null
  ): string {
    if (remainingSeconds === null) {
      return baseMessage;
    }

    return `${baseMessage} Nouvelle tentative dans ${remainingSeconds} s.`;
  }

  private clearAutoRetry(): void {
    this.autoRetryState?.subscription?.unsubscribe();
    this.autoRetryState = null;
    this.autoRetrySeconds.set(null);
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
