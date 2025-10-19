import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'lib-search-filter-field',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  templateUrl: './search-filter-field.html',
  styleUrl: './search-filter-field.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchFilterField {
  @Input() label = 'Recherche';
  @Input() placeholder = 'Nom, jeu, description...';
  @Input() prefixIcon = 'search';
  @Input() controlId = 'search';
  @Input() autocomplete = 'off';
  @Input() searchTerm = '';
  @Output() searchTermChange = new EventEmitter<string>();

  handleInputChange(value: string): void {
    this.searchTermChange.emit(value);
  }
}
