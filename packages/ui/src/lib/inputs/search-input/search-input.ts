import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'lib-search-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-input.html',
  styleUrls: ['./search-input.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchInputComponent {
  @Input() value = '';
  @Input() placeholder = 'Rechercher...';
  @Input() debounce = 0;
  @Output() valueChange = new EventEmitter<string>();

  private debounceTimer?: ReturnType<typeof setTimeout>;

  onInput(value: string): void {
    if (this.debounce > 0) {
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }
      this.debounceTimer = setTimeout(() => {
        this.valueChange.emit(value);
      }, this.debounce);
    } else {
      this.valueChange.emit(value);
    }
  }

  clear(): void {
    this.value = '';
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.valueChange.emit('');
  }
}
