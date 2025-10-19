import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'lib-search-input',
  standalone: true,
  imports: [FormsModule, MatIconModule],
  templateUrl: './search-input.html',
  styleUrls: ['./search-input.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchInputComponent implements OnDestroy {
  @Input() value = '';
  @Input() placeholder = 'Rechercher...';
  @Input() inputId?: string;
  @Input() debounce = 0;
  @Input() icon?: string;
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

  ngOnDestroy(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
  }
}
