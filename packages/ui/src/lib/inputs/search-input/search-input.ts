import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  effect,
  signal,
  untracked,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Subject, of, timer } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';

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
  @Input() icon?: string;
  @Output() valueChange = new EventEmitter<string>();

  private readonly debounceDuration = signal(0);
  @Input()
  get debounce(): number {
    return this.debounceDuration();
  }

  set debounce(value: number) {
    this.debounceDuration.set(Math.max(0, value ?? 0));
  }

  private readonly inputChanges$ = new Subject<string>();
  private readonly cancelPending$ = new Subject<void>();

  private readonly debouncedValue = toSignal<string | null>(
    this.inputChanges$.pipe(
      switchMap((inputValue) => {
        const delay = Math.max(0, this.debounceDuration());
        return delay > 0
          ? timer(delay).pipe(
              takeUntil(this.cancelPending$),
              map(() => inputValue)
            )
          : of(inputValue);
      })
    ),
    { initialValue: null, requireSync: false }
  );

  private readonly emitEffect = effect(() => {
    const nextValue = this.debouncedValue();
    if (nextValue === null) {
      return;
    }

    // Use untracked to prevent the emit from being tracked as a dependency
    untracked(() => this.valueChange.emit(nextValue));
  });

  onInput(value: string): void {
    this.value = value;
    this.inputChanges$.next(value);
  }

  clear(): void {
    this.value = '';
    this.cancelPending$.next();
    this.valueChange.emit('');
  }

  ngOnDestroy(): void {
    this.cancelPending$.next();
    this.cancelPending$.complete();
    this.inputChanges$.complete();
  }
}
