import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { findClosestMatches } from '@org/ui';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { Session, SessionsService } from '../../core/services/sessions.service';

@Component({
  selector: 'app-session-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './session-edit.html',
  styleUrls: ['./session-create.css'],
})
export class SessionEditComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly sessionsService = inject(SessionsService);
  private readonly authService = inject(AuthService);
  private readonly notifications = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  sessionForm!: FormGroup;
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  sessionId: string | null = null;
  readonly session = signal<Session | null>(null);

  // Liste des jeux existants pour l'autocomplétion
  readonly existingGames = signal<string[]>([]);

  // Suggestions de correction pour le jeu
  readonly gameSuggestions = signal<
    Array<{ value: string; similarity: number }>
  >([]);

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
        queryParams: { returnUrl: this.router.url },
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
    this.sessionForm
      .get('game')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.checkGameSuggestions(value);
      });
  }

  ngOnInit(): void {
    // Récupérer l'ID de la session depuis l'URL
    this.sessionId = this.route.snapshot.paramMap.get('id');
    if (!this.sessionId) {
      this.error.set('ID de session invalide');
      this.loading.set(false);
      return;
    }

    // Charger la session
    this.loadSession(this.sessionId);

    // Charger les jeux existants
    this.loadExistingGames();
  }

  loadSession(id: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.sessionsService
      .getSession(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (session) => {
          this.session.set(session);

          // Vérifier que l'utilisateur est le créateur
          const currentUser = this.authService.getCurrentUser();
          if (!currentUser || session.hostId !== currentUser.id) {
            this.error.set("Vous n'êtes pas autorisé à modifier cette session");
            this.loading.set(false);
            return;
          }

          // Pré-remplir le formulaire
          const dateForInput = new Date(session.date)
            .toISOString()
            .slice(0, 16);
          this.sessionForm.patchValue({
            game: session.game,
            title: session.title,
            description: session.description || '',
            date: dateForInput,
            online: session.online,
            level: session.level,
            playersMax: session.playersMax,
            tagColor: session.tagColor || 'BLUE',
          });

          this.loading.set(false);
        },
        error: (err) => {
          console.error('Erreur lors du chargement de la session:', err);
          this.error.set(
            "Impossible de charger la session. Elle n'existe peut-être pas."
          );
          this.loading.set(false);
        },
      });
  }

  loadExistingGames(): void {
    this.sessionsService
      .getSessions()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (sessions) => {
          const games = [...new Set(sessions.map((s) => s.game))].sort();
          this.existingGames.set(games);
        },
        error: (err) => {
          console.error('Erreur lors du chargement des jeux:', err);
        },
      });
  }

  checkGameSuggestions(value: string): void {
    if (!value || value.length < 2) {
      this.gameSuggestions.set([]);
      return;
    }

    // Vérifier si le jeu existe déjà exactement
    if (this.existingGames().includes(value)) {
      this.gameSuggestions.set([]);
      return;
    }

    // Trouver les correspondances proches
    const matches = findClosestMatches(value, this.existingGames(), 3, 0.6);
    this.gameSuggestions.set(matches);
  }

  applySuggestion(game: string): void {
    this.sessionForm.patchValue({ game });
    this.gameSuggestions.set([]);
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

    if (!this.sessionId) {
      this.error.set('ID de session invalide');
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    const formValue = this.sessionForm.value;
    const sessionData = {
      ...formValue,
      date: new Date(formValue.date).toISOString(),
    };

    this.sessionsService
      .updateSession(this.sessionId, sessionData)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.saving.set(false))
      )
      .subscribe({
        next: (updatedSession) => {
          this.notifications.success('Session modifiée avec succès.');
          this.router.navigate(['/sessions', updatedSession.id]);
        },
        error: (err) => {
          console.error('Erreur lors de la modification:', err);
          this.error.set(
            err.error?.message ||
              'Une erreur est survenue lors de la modification de la session'
          );
        },
      });
  }

  cancel(): void {
    if (this.sessionId) {
      this.router.navigate(['/sessions', this.sessionId]);
    } else {
      this.router.navigate(['/sessions']);
    }
  }

  getErrorMessage(fieldName: string): string {
    const control = this.sessionForm.get(fieldName);
    if (!control?.errors) return '';

    if (control.errors['required']) return 'Ce champ est requis';
    if (control.errors['minlength']) {
      const minLength = control.errors['minlength'].requiredLength;
      return `Minimum ${minLength} caractères`;
    }
    if (control.errors['min']) {
      const min = control.errors['min'].min;
      return `Le minimum est ${min}`;
    }
    if (control.errors['max']) {
      const max = control.errors['max'].max;
      return `Le maximum est ${max}`;
    }

    return 'Champ invalide';
  }
}
