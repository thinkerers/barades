import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { GameSystemInputComponent } from '../inputs/game-system-input/game-system-input.component';

type SessionsFilterMode = 'all' | 'online' | 'onsite';

@Component({
  selector: 'lib-sessions-filters-card',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    GameSystemInputComponent,
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
  @Input() sessionType: SessionsFilterMode = 'all';
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
  @Output() sessionTypeChange = new EventEmitter<SessionsFilterMode>();
  @Output() gameFilterChange = new EventEmitter<string>();
  @Output() availabilityChange = new EventEmitter<boolean>();

  get hasActiveFilters(): boolean {
    return this.activeFiltersCount > 0;
  }

  get hasHostFilterValue(): boolean {
    return this.selectedHost.trim().length > 0;
  }
}
