
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

/**
 * Empty state component for displaying "no results" or "no data" states
 *
 * @example
 * <lib-empty-state
 *   message="Aucune session ne correspond à vos critères"
 *   actionLabel="Réinitialiser les filtres"
 *   (action)="resetFilters()">
 * </lib-empty-state>
 */
@Component({
  selector: 'lib-empty-state',
  standalone: true,
  imports: [],
  template: `
    <div class="empty-state">
      <p class="empty-state__message">{{ message }}</p>
      @if (actionLabel) {
        <button
          type="button"
          (click)="action.emit()"
          [class]="buttonClass"
          >
          {{ actionLabel }}
        </button>
      }
    </div>
    `,
  styleUrls: ['./empty-state.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  /**
   * Message to display to the user
   */
  @Input({ required: true }) message!: string;

  /**
   * Optional action button label
   */
  @Input() actionLabel?: string;

  /**
   * CSS class for the button (default: 'button button--secondary')
   */
  @Input() buttonClass = 'button button--secondary';

  /**
   * Event emitted when the action button is clicked
   */
  @Output() action = new EventEmitter<void>();
}
