import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SessionsService } from '../../core/services/sessions.service';
import { findClosestMatches } from '../../shared/utils/levenshtein';

@Component({
  selector: 'app-session-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './session-create.html',
  styleUrls: ['./session-create.css'],
})
export class SessionCreateComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly sessionsService = inject(SessionsService);
  private readonly authService = inject(AuthService);

  sessionForm!: FormGroup;
  loading = false;
  error: string | null = null;

  // Liste des jeux existants pour l'autocomplétion
  existingGames: string[] = [];

  // Suggestions de correction pour le jeu
  gameSuggestions: Array<{ value: string; similarity: number }> = [];

  levels = [
    { value: 'BEGINNER', label: 'Débutant' },
    { value: 'INTERMEDIATE', label: 'Intermédiaire' },
    { value: 'ADVANCED', label: 'Avancé' },
    { value: 'OPEN', label: 'Ouvert à tous' },
  ];

  tagColors = [
    { value: 'RED', label: 'Rouge' },
    { value: 'GREEN', label: 'Vert' },
    { value: 'BLUE', label: 'Bleu' },
    { value: 'PURPLE', label: 'Violet' },
    { value: 'GRAY', label: 'Gris' },
  ];

  constructor() {
    // Vérifier si l'utilisateur est connecté
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: '/sessions/new' },
      });
      return;
    }

    this.sessionForm = this.fb.group({
      game: ['', [Validators.required, Validators.minLength(2)]],
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: [''],
      date: ['', Validators.required],
      online: [false],
      level: ['OPEN', Validators.required],
      playersMax: [
        4,
        [Validators.required, Validators.min(2), Validators.max(12)],
      ],
      tagColor: ['BLUE', Validators.required],
    });

    // Écouter les changements du champ "game" pour détecter les fautes
    this.sessionForm.get('game')?.valueChanges.subscribe((value) => {
      this.checkGameSuggestions(value);
    });
  }

  ngOnInit(): void {
    // Charger les jeux existants pour l'autocomplétion et les suggestions
    this.loadExistingGames();
  }

  loadExistingGames(): void {
    this.sessionsService.getSessions().subscribe({
      next: (sessions) => {
        // Extraire les noms de jeux uniques et les trier
        this.existingGames = [...new Set(sessions.map((s) => s.game))].sort();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des jeux:', err);
        // Continuer même si le chargement échoue
      },
    });
  }

  /**
   * Vérifie si le jeu saisi est proche d'un jeu existant
   * et propose des suggestions si nécessaire
   */
  checkGameSuggestions(value: string): void {
    if (!value || value.trim().length < 3) {
      this.gameSuggestions = [];
      return;
    }

    console.log('🔍 Vérification suggestions pour:', value);
    console.log('📚 Jeux existants:', this.existingGames);

    // Trouver les jeux similaires avec seuil de 0.6 (60% de similarité)
    this.gameSuggestions = findClosestMatches(
      value,
      this.existingGames,
      0.6,
      3
    );

    console.log('💡 Suggestions trouvées:', this.gameSuggestions);
  }

  /**
   * Applique une suggestion au champ "game"
   */
  applySuggestion(game: string): void {
    this.sessionForm.patchValue({ game });
    this.gameSuggestions = [];
  }

  onSubmit(): void {
    if (this.sessionForm.invalid) {
      Object.keys(this.sessionForm.controls).forEach((key) => {
        const control = this.sessionForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    this.loading = true;
    this.error = null;

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.error = 'Vous devez être connecté pour créer une session';
      this.loading = false;
      return;
    }

    const formValue = this.sessionForm.value;
    const sessionData = {
      ...formValue,
      date: new Date(formValue.date).toISOString(),
      hostId: currentUser.id,
    };

    this.sessionsService.createSession(sessionData).subscribe({
      next: (session) => {
        console.log('Session créée:', session);
        this.router.navigate(['/sessions']);
      },
      error: (err) => {
        console.error('Erreur création session:', err);
        this.error =
          err.error?.message || 'Erreur lors de la création de la session';
        this.loading = false;
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/sessions']);
  }

  getErrorMessage(field: string): string {
    const control = this.sessionForm.get(field);
    if (!control?.touched || !control.errors) return '';

    if (control.errors['required']) return 'Ce champ est requis';
    if (control.errors['minLength'])
      return `Minimum ${control.errors['minLength'].requiredLength} caractères`;
    if (control.errors['min']) return `Minimum ${control.errors['min'].min}`;
    if (control.errors['max']) return `Maximum ${control.errors['max'].max}`;

    return 'Champ invalide';
  }
}
