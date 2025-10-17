import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'lib-error-message',
  standalone: true,
  imports: [CommonModule, MatIconModule],
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
   * Material icon name to display
   * @default 'error_outline'
   */
  @Input() icon = 'error_outline';

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
