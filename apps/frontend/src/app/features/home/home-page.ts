import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { AsyncStateComponent, AsyncStateStatus } from '@org/ui';
import { firstValueFrom, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Session, SessionsService } from '../../core/services/sessions.service';
import { SessionCardComponent } from '../sessions/session-card';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatIconModule,
    MatButtonModule,
    SessionCardComponent,
    AsyncStateComponent,
  ],
  selector: 'app-home-page',
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage implements OnInit {
  private router = inject(Router);
  private sessionsService = inject(SessionsService);

  // Form controls pour la recherche
  gameControl = new FormControl('');
  cityControl = new FormControl('');

  // Listes d'options pour l'autocomplete
  games = [
    'Dungeons & Dragons 5e',
    'Pathfinder 2e',
    'Call of Cthulhu',
    'Vampire: The Masquerade',
    'Star Wars: Edge of the Empire',
    'Shadowrun',
    'Warhammer 40k',
    'L5R: Legend of the Five Rings',
  ];

  cities = [
    'Bruxelles',
    'Brussels',
    'Liège',
    'Charleroi',
    'Gand',
    'Antwerp',
    'Tournai',
    'En ligne',
  ];

  // Observables pour les suggestions filtrées
  filteredGames$: Observable<string[]>;
  filteredCities$: Observable<string[]>;

  // Sessions en vedette (chargées depuis le service)
  readonly featuredSessions = signal<Session[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly defaultErrorMessage =
    'Impossible de charger les sessions en vedette.';
  readonly emptyMessage = 'Aucune session disponible pour le moment.';

  readonly featuredSessionsState = computed<AsyncStateStatus>(() => {
    if (this.loading()) {
      return 'loading';
    }

    if (this.error()) {
      return 'error';
    }

    return this.featuredSessions().length ? 'ready' : 'empty';
  });

  constructor() {
    // Configuration des filtres pour l'autocomplete
    this.filteredGames$ = this.gameControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filterGames(value || ''))
    );

    this.filteredCities$ = this.cityControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filterCities(value || ''))
    );
  }

  ngOnInit(): void {
    void this.loadFeaturedSessions();
  }

  async loadFeaturedSessions(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const sessions = await firstValueFrom(this.sessionsService.getSessions());
      this.featuredSessions.set(sessions.slice(0, 3));
    } catch (err) {
      console.error('Error loading featured sessions:', err);
      this.error.set(this.defaultErrorMessage);
    } finally {
      this.loading.set(false);
    }
  }

  private _filterGames(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.games.filter((game) =>
      game.toLowerCase().includes(filterValue)
    );
  }

  private _filterCities(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.cities.filter((city) =>
      city.toLowerCase().includes(filterValue)
    );
  }

  onSearch(): void {
    const game = this.gameControl.value;
    const city = this.cityControl.value;

    // Navigation vers la page sessions avec les paramètres de recherche
    this.router.navigate(['/sessions'], {
      queryParams: {
        game: game || undefined,
        location: city || undefined,
      },
    });
  }
}
