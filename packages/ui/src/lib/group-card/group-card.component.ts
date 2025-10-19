import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  computed,
  signal,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

export type GroupPlaystyle =
  | 'COMPETITIVE'
  | 'CASUAL'
  | 'STORY_DRIVEN'
  | 'SANDBOX'
  | string;

export interface GroupCardCreator {
  username: string;
}

export interface GroupCardMemberCount {
  members?: number | null;
}

export interface GroupCardData {
  id: string;
  name: string;
  description?: string | null;
  playstyle: GroupPlaystyle;
  isRecruiting: boolean;
  isPublic: boolean;
  maxMembers?: number | null;
  creatorId?: string;
  creator?: GroupCardCreator | null;
  _count?: GroupCardMemberCount | null;
}

@Component({
  selector: 'lib-group-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './group-card.component.html',
  styleUrl: './group-card.component.css',
})
export class GroupCardComponent {
  private readonly groupSignal = signal<GroupCardData | null>(null);
  private readonly primaryActionDisabledSignal = signal(false);
  private readonly showSecondaryActionSignal = signal<boolean | undefined>(
    undefined
  );
  private readonly secondaryActionDisabledSignal = signal<boolean | undefined>(
    undefined
  );
  private readonly secondaryActionLoadingSignal = signal(false);

  @Input({ required: true })
  set group(value: GroupCardData) {
    this.groupSignal.set(value);
  }
  get group(): GroupCardData {
    const value = this.groupSignal();
    if (value === null) {
      throw new Error('GroupCardComponent requires a group input.');
    }
    return value;
  }

  @Input() primaryActionLabel = 'Voir les détails';
  @Input()
  set primaryActionDisabled(value: boolean) {
    this.primaryActionDisabledSignal.set(value);
  }
  get primaryActionDisabled(): boolean {
    return this.primaryActionDisabledSignal();
  }

  @Input() secondaryActionLabel = 'Rejoindre';
  @Input()
  set showSecondaryAction(value: boolean | undefined) {
    this.showSecondaryActionSignal.set(value);
  }
  get showSecondaryAction(): boolean | undefined {
    return this.showSecondaryActionSignal();
  }

  @Input()
  set secondaryActionDisabled(value: boolean | undefined) {
    this.secondaryActionDisabledSignal.set(value);
  }
  get secondaryActionDisabled(): boolean | undefined {
    return this.secondaryActionDisabledSignal();
  }

  @Input()
  set secondaryActionLoading(value: boolean) {
    this.secondaryActionLoadingSignal.set(value);
  }
  get secondaryActionLoading(): boolean {
    return this.secondaryActionLoadingSignal();
  }

  @Output() primaryAction = new EventEmitter<void>();
  @Output() secondaryAction = new EventEmitter<void>();

  readonly memberCount = computed(() => {
    const group = this.groupSignal();
    return group?._count?.members ?? 0;
  });

  readonly isFull = computed(() => {
    const group = this.groupSignal();
    if (!group || group.maxMembers == null) {
      return false;
    }
    return this.memberCount() >= group.maxMembers;
  });

  readonly statusLabel = computed(() => {
    if (this.isFull()) {
      return 'Complet';
    }

    const group = this.groupSignal();
    if (group?.isRecruiting) {
      return 'Recrute';
    }

    return 'Privé';
  });

  readonly statusClass = computed(() => {
    if (this.isFull()) {
      return 'status--full';
    }

    const group = this.groupSignal();
    if (group?.isRecruiting) {
      return 'status--recruiting';
    }

    return 'status--private';
  });

  readonly shouldShowSecondaryAction = computed(() => {
    const explicit = this.showSecondaryActionSignal();
    if (explicit !== undefined) {
      return explicit;
    }

    const group = this.groupSignal();
    return (group?.isRecruiting ?? false) && !this.isFull();
  });

  readonly isSecondaryActionDisabled = computed(() => {
    if (this.secondaryActionLoadingSignal()) {
      return true;
    }

    const explicit = this.secondaryActionDisabledSignal();
    if (explicit !== undefined) {
      return explicit;
    }

    return this.isFull();
  });

  getPlaystyleLabel(playstyle: GroupPlaystyle): string {
    const labels: Record<string, string> = {
      COMPETITIVE: 'Compétitif',
      CASUAL: 'Décontracté',
      STORY_DRIVEN: 'Narratif',
      SANDBOX: 'Bac à sable',
    };

    return labels[playstyle] ?? playstyle;
  }

  getPlaystyleColor(playstyle: GroupPlaystyle): string {
    const colors: Record<string, string> = {
      COMPETITIVE: 'red',
      CASUAL: 'green',
      STORY_DRIVEN: 'purple',
      SANDBOX: 'blue',
    };

    return colors[playstyle] ?? 'gray';
  }

  onPrimaryAction(): void {
    if (this.primaryActionDisabled) {
      return;
    }

    this.primaryAction.emit();
  }

  onSecondaryAction(): void {
    if (this.isSecondaryActionDisabled()) {
      return;
    }

    this.secondaryAction.emit();
  }
}
