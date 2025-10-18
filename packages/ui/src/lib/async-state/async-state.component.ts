import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { EmptyStateComponent } from '../feedback/empty-state/empty-state';
import { ErrorMessageComponent } from '../feedback/error-message/error-message';
import { LoadingSpinnerComponent } from '../feedback/loading-spinner/loading-spinner';

export type AsyncStateStatus = 'loading' | 'error' | 'empty' | 'ready';

@Component({
  standalone: true,
  selector: 'lib-async-state',
  templateUrl: './async-state.component.html',
  styleUrl: './async-state.component.css',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    LoadingSpinnerComponent,
    ErrorMessageComponent,
    EmptyStateComponent,
  ],
})
export class AsyncStateComponent {
  @Input() status: AsyncStateStatus = 'ready';
  @Input() loadingMessage = 'Chargement en cours...';
  @Input() errorTitle = 'Une erreur est survenue';
  @Input() errorMessage =
    'Nous ne parvenons pas à récupérer les données. Veuillez réessayer ultérieurement.';
  @Input() emptyTitle = 'Aucun résultat';
  @Input() emptyMessage = "Il n'y a aucun élément à afficher pour le moment.";
  @Input() showRetry = true;

  @Output() retry = new EventEmitter<void>();

  onRetry(): void {
    this.retry.emit();
  }
}
