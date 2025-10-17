import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
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
  featuredSessions: Session[] = [];
  loading = false;
  error: string | null = null;

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
    this.loadFeaturedSessions();
  }

  loadFeaturedSessions(): void {
    this.loading = true;
    this.error = null;

    this.sessionsService.getSessions().subscribe({
      next: (sessions) => {
        // Prendre les 3 premières sessions comme sessions en vedette
        this.featuredSessions = sessions.slice(0, 3);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading featured sessions:', err);
        this.error = 'Impossible de charger les sessions en vedette.';
        this.loading = false;
      },
    });
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
