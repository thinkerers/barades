import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

@Component({
  selector: 'lib-error-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-message.html',
  styleUrl: './error-message.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorMessageComponent {
  /**
   * Error message to display
   */
  @Input() message = '';

  /**
   * Icon type to display
   * @default 'circle-error'
   */
  @Input() icon = 'circle-error';

  /**
   * Label for the action button (optional)
   * If not provided, no button is displayed
   */
  @Input() actionLabel?: string;

  /**
   * Event emitted when action button is clicked
   */
  @Output() action = new EventEmitter<void>();

  /**
   * Handle action button click
   */
  onActionClick(): void {
    this.action.emit();
  }
}
