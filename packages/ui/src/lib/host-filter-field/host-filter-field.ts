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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'lib-host-filter-field',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  templateUrl: './host-filter-field.html',
  styleUrl: './host-filter-field.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HostFilterField {
  @Input() selectedHost = '';
  @Input() filteredHostOptions: string[] = [];
  @Input() isScopeFilterActive = false;
  @Input() placeholder = 'Rechercher un hôte...';
  @Input() controlId = 'host-filter';
  @Input() autocomplete = 'off';
  @Input() clearButtonAriaLabel = 'Effacer le filtre hôte';

  @Output() hostFilterChange = new EventEmitter<string>();
  @Output() hostFilterFocus = new EventEmitter<void>();
  @Output() clearHostFilter = new EventEmitter<void>();
  @Output() hostOptionSelected = new EventEmitter<string>();

  get hasHostFilterValue(): boolean {
    return this.selectedHost.trim().length > 0;
  }

  get isClearButtonDisabled(): boolean {
    return !this.hasHostFilterValue && !this.isScopeFilterActive;
  }

  handleInputChange(value: string): void {
    this.selectedHost = value;
    this.hostFilterChange.emit(value);
  }

  handleInputFocus(): void {
    this.hostFilterFocus.emit();
  }

  handleClearClick(): void {
    this.selectedHost = '';
    this.clearHostFilter.emit();
  }

  handleOptionSelected(value: string): void {
    this.hostOptionSelected.emit(value);
  }
}
