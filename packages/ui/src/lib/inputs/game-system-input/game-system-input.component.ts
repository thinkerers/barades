import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { findClosestMatches } from '../../utils/levenshtein';

interface GameOption {
  value: string;
  similarity?: number;
  fromSuggestion: boolean;
}

@Component({
  selector: 'lib-game-system-input',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatAutocompleteModule,
    MatButtonModule,
  ],
  templateUrl: './game-system-input.component.html',
  styleUrls: ['./game-system-input.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameSystemInputComponent
  implements ControlValueAccessor, OnChanges
{
  @Input() label = 'Système de jeu';
  @Input() placeholder = 'Rechercher un jeu...';
  @Input() gameSystems: string[] = [];
  @Input() required = false;
  @Input() showClearButton = true;
  @Input() errorMessage = 'Champ invalide';
  @Input() maxSuggestions = 5;
  @Input() minSuggestionLength = 3;
  @Input() suggestionThreshold = 0.55;
  @Input() prefixIcon = 'sports_esports';
  @Input() clearButtonAriaLabel = 'Effacer la valeur du champ';

  @Output() valueChange = new EventEmitter<string>();
  @Output() optionSelected = new EventEmitter<string>();

  value = '';
  filteredOptions: GameOption[] = [];
  isDisabled = false;

  private readonly ngControl = inject(NgControl, {
    optional: true,
    self: true,
  });

  private onChange: (value: string) => void = () => {
    return;
  };
  private onTouched: () => void = () => {
    return;
  };

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['gameSystems'] || changes['suggestionThreshold']) {
      this.updateOptions();
    }
  }

  writeValue(value: string | null): void {
    this.value = value ?? '';
    this.updateOptions();
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  onInputFromEvent(event: Event): void {
    const value = (event.target as HTMLInputElement | null)?.value ?? '';
    this.onInput(value);
  }

  onInput(value: string): void {
    if (this.isDisabled) {
      return;
    }

    this.value = value;
    this.updateOptions();
    this.propagateChange(this.value);
    this.valueChange.emit(this.value);
  }

  onFocus(): void {
    this.updateOptions();
  }

  onBlur(): void {
    this.markTouched();
  }

  selectOption(value: string): void {
    if (this.isDisabled) {
      return;
    }

    this.value = value;
    this.updateOptions();
    this.propagateChange(this.value);
    this.markTouched();
    this.valueChange.emit(this.value);
    this.optionSelected.emit(this.value);
  }

  clearValue(): void {
    if (this.isDisabled || !this.showClearButton) {
      return;
    }

    if (!this.value) {
      return;
    }

    this.value = '';
    this.updateOptions();
    this.propagateChange(this.value);
    this.markTouched();
    this.valueChange.emit(this.value);
  }

  get showError(): boolean {
    const control = this.ngControl?.control;
    if (!control) {
      return false;
    }

    return control.invalid && (control.touched || control.dirty);
  }

  get computedErrorMessage(): string {
    return this.showError ? this.errorMessage : '';
  }

  trackByOption(_: number, option: GameOption): string {
    return option.value;
  }

  private updateOptions(): void {
    this.filteredOptions = this.computeOptions(this.value);
  }

  private propagateChange(value: string): void {
    if (typeof this.onChange === 'function') {
      this.onChange(value);
    }
  }

  private markTouched(): void {
    if (typeof this.onTouched === 'function') {
      this.onTouched();
    }
  }

  private computeOptions(query: string): GameOption[] {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      return this.buildOptions(this.gameSystems);
    }

    const normalizedQuery = trimmedQuery.toLowerCase();
    const exactMatch = this.gameSystems.find(
      (game) => game.toLowerCase() === normalizedQuery
    );

    if (exactMatch) {
      return this.buildOptions(this.gameSystems);
    }

    const canBuildSuggestions = trimmedQuery.length >= this.minSuggestionLength;

    const fuzzyMatches = canBuildSuggestions
      ? findClosestMatches(
          trimmedQuery,
          this.gameSystems,
          this.suggestionThreshold,
          this.maxSuggestions
        )
      : [];

    const directMatches = this.gameSystems.filter((game) =>
      game.toLowerCase().includes(normalizedQuery)
    );

    const options: GameOption[] = [];
    const seen = new Set<string>();

    for (const match of fuzzyMatches) {
      if (seen.has(match.value)) {
        continue;
      }

      options.push({
        value: match.value,
        similarity: match.similarity,
        fromSuggestion: true,
      });
      seen.add(match.value);
    }

    for (const match of directMatches) {
      if (seen.has(match)) {
        continue;
      }

      options.push({
        value: match,
        fromSuggestion: false,
      });
      seen.add(match);
    }

    if (!options.length) {
      return this.buildOptions(this.gameSystems);
    }

    return options;
  }

  private buildOptions(games: string[]): GameOption[] {
    return games.map((game) => ({
      value: game,
      fromSuggestion: false,
    }));
  }
}
