import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
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
    MatButtonModule,
    MatIconModule,
    LoadingSpinnerComponent,
    ErrorMessageComponent,
    EmptyStateComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AsyncStateComponent {
  readonly status = input<AsyncStateStatus>('ready');
  readonly loadingMessage = input('Chargement en cours...');
  readonly errorTitle = input('Une erreur est survenue');
  readonly errorMessage = input(
    'Nous ne parvenons pas à récupérer les données. Veuillez réessayer ultérieurement.'
  );
  readonly emptyTitle = input('Aucun résultat');
  readonly emptyMessage = input(
    "Il n'y a aucun élément à afficher pour le moment."
  );
  readonly showRetry = input(true);

  readonly retry = output<void>();

  onRetry(): void {
    this.retry.emit();
  }
}
