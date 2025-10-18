import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
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
  @Input({ required: true }) group!: GroupCardData;
  @Input() primaryActionLabel = 'Voir les détails';
  @Input() primaryActionDisabled = false;
  @Input() secondaryActionLabel = 'Rejoindre';
  @Input() showSecondaryAction: boolean | undefined;
  @Input() secondaryActionDisabled: boolean | undefined;
  @Input() secondaryActionLoading = false;

  @Output() primaryAction = new EventEmitter<void>();
  @Output() secondaryAction = new EventEmitter<void>();

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

  getMemberCount(): number {
    return this.group._count?.members ?? 0;
  }

  isFull(): boolean {
    if (this.group.maxMembers == null) {
      return false;
    }

    return this.getMemberCount() >= this.group.maxMembers;
  }

  getStatusLabel(): string {
    if (this.isFull()) {
      return 'Complet';
    }

    if (this.group.isRecruiting) {
      return 'Recrute';
    }

    return 'Privé';
  }

  getStatusClass(): string {
    if (this.isFull()) {
      return 'status--full';
    }

    if (this.group.isRecruiting) {
      return 'status--recruiting';
    }

    return 'status--private';
  }

  get shouldShowSecondaryAction(): boolean {
    const explicit = this.showSecondaryAction;
    if (explicit !== undefined) {
      return explicit;
    }

    return this.group.isRecruiting && !this.isFull();
  }

  get isSecondaryActionDisabled(): boolean {
    if (this.secondaryActionLoading) {
      return true;
    }

    if (this.secondaryActionDisabled !== undefined) {
      return this.secondaryActionDisabled;
    }

    return this.isFull();
  }

  onPrimaryAction(): void {
    if (this.primaryActionDisabled) {
      return;
    }

    this.primaryAction.emit();
  }

  onSecondaryAction(): void {
    if (this.isSecondaryActionDisabled) {
      return;
    }

    this.secondaryAction.emit();
  }
}
