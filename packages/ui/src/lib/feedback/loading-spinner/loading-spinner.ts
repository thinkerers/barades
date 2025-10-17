import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/**
 * Loading spinner component with optional message
 *
 * @example
 * <lib-loading-spinner message="Chargement des données..."></lib-loading-spinner>
 */
@Component({
  selector: 'lib-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-spinner">
      <div class="spinner"></div>
      <p *ngIf="message" class="loading-spinner__message">{{ message }}</p>
    </div>
  `,
  styleUrls: ['./loading-spinner.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingSpinnerComponent {
  /**
   * Optional loading message to display below the spinner
   */
  @Input() message?: string;
}
