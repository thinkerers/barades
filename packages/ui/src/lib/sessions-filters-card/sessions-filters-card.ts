import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { HostFilterField } from '../host-filter-field/host-filter-field';
import { GameSystemInputComponent } from '../inputs/game-system-input/game-system-input.component';
import { SearchFilterField } from '../search-filter-field/search-filter-field';
import type { SessionTypeFilter } from '../session-type-toggle-group';
import { SessionTypeToggleGroup } from '../session-type-toggle-group';

@Component({
  selector: 'lib-sessions-filters-card',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    HostFilterField,
    GameSystemInputComponent,
    SearchFilterField,
    SessionTypeToggleGroup,
  ],
  templateUrl: './sessions-filters-card.html',
  styleUrl: './sessions-filters-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionsFiltersCard {
  @Input({ transform: (value: number | null | undefined) => value ?? 0 })
  activeFiltersCount = 0;
  @Input() searchTerm = '';
  @Input() selectedHost = '';
  @Input() filteredHostOptions: string[] = [];
  @Input() isScopeFilterActive = false;
  @Input() sessionType: SessionTypeFilter = 'all';
  @Input() selectedGameSystem = '';
  @Input() gameSystems: string[] = [];
  @Input() maxGameSuggestions = 5;
  @Input() minGameSuggestionLength = 3;
  @Input() gameSuggestionThreshold = 0.55;
  @Input() onlyAvailable = false;

  @Output() resetFilters = new EventEmitter<void>();
  @Output() searchTermChange = new EventEmitter<string>();
  @Output() hostFilterChange = new EventEmitter<string>();
  @Output() hostFilterFocus = new EventEmitter<void>();
  @Output() clearHostFilter = new EventEmitter<void>();
  @Output() hostOptionSelected = new EventEmitter<string>();
  @Output() sessionTypeChange = new EventEmitter<SessionTypeFilter>();
  @Output() gameFilterChange = new EventEmitter<string>();
  @Output() availabilityChange = new EventEmitter<boolean>();

  get hasActiveFilters(): boolean {
    return this.activeFiltersCount > 0;
  }
}
