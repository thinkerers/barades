import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

export type SessionTypeFilter = 'all' | 'online' | 'onsite';

@Component({
  selector: 'lib-session-type-toggle-group',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './session-type-toggle-group.html',
  styleUrl: './session-type-toggle-group.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionTypeToggleGroup {
  @Input() sessionType: SessionTypeFilter = 'all';
  @Output() sessionTypeChange = new EventEmitter<SessionTypeFilter>();

  readonly sessionTypeOptions: ReadonlyArray<{
    readonly value: SessionTypeFilter;
    readonly label: string;
    readonly icon: string;
  }> = [
    { value: 'all', label: 'Toutes', icon: 'dashboard' },
    { value: 'online', label: 'En ligne', icon: 'computer' },
    { value: 'onsite', label: 'Sur table', icon: 'groups' },
  ];

  selectType(type: SessionTypeFilter): void {
    this.sessionTypeChange.emit(type);
  }

  isActive(type: SessionTypeFilter): boolean {
    return this.sessionType === type;
  }
}
