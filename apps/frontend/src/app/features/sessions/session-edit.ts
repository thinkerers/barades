import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { findClosestMatches } from '@org/ui';
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
  private readonly cdr = inject(ChangeDetectorRef);

  sessionForm!: FormGroup;
  loading = true;
  saving = false;
  error: string | null = null;
  sessionId: string | null = null;
  session: Session | null = null;

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
    this.sessionForm.get('game')?.valueChanges.subscribe((value) => {
      this.checkGameSuggestions(value);
    });
  }

  ngOnInit(): void {
    // Récupérer l'ID de la session depuis l'URL
    this.sessionId = this.route.snapshot.paramMap.get('id');
    if (!this.sessionId) {
      this.error = 'ID de session invalide';
      this.loading = false;
      this.cdr.markForCheck();
      return;
    }

    // Charger la session
    this.loadSession(this.sessionId);

    // Charger les jeux existants
    this.loadExistingGames();
  }

  loadSession(id: string): void {
    this.loading = true;
    this.error = null;

    this.sessionsService.getSession(id).subscribe({
      next: (session) => {
        this.session = session;

        // Vérifier que l'utilisateur est le créateur
        const currentUser = this.authService.getCurrentUser();
        if (!currentUser || session.hostId !== currentUser.id) {
          this.error = "Vous n'êtes pas autorisé à modifier cette session";
          this.loading = false;
          this.cdr.markForCheck();
          return;
        }

        // Pré-remplir le formulaire
        const dateForInput = new Date(session.date).toISOString().slice(0, 16);
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

        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Erreur lors du chargement de la session:', err);
        this.error =
          "Impossible de charger la session. Elle n'existe peut-être pas.";
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  loadExistingGames(): void {
    this.sessionsService.getSessions().subscribe({
      next: (sessions) => {
        this.existingGames = [...new Set(sessions.map((s) => s.game))].sort();
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des jeux:', err);
        this.cdr.markForCheck();
      },
    });
  }

  checkGameSuggestions(value: string): void {
    if (!value || value.length < 2) {
      this.gameSuggestions = [];
      return;
    }

    // Vérifier si le jeu existe déjà exactement
    if (this.existingGames.includes(value)) {
      this.gameSuggestions = [];
      return;
    }

    // Trouver les correspondances proches
    const matches = findClosestMatches(value, this.existingGames, 3, 0.6);
    this.gameSuggestions = matches;
  }

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
      this.cdr.markForCheck();
      return;
    }

    if (!this.sessionId) {
      this.error = 'ID de session invalide';
      this.cdr.markForCheck();
      return;
    }

    this.saving = true;
    this.error = null;
    this.cdr.markForCheck();

    const formValue = this.sessionForm.value;
    const sessionData = {
      ...formValue,
      date: new Date(formValue.date).toISOString(),
    };

    this.sessionsService.updateSession(this.sessionId, sessionData).subscribe({
      next: (updatedSession) => {
        this.saving = false;
        this.notifications.success('Session modifiée avec succès.');
        this.router.navigate(['/sessions', updatedSession.id]);
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Erreur lors de la modification:', err);
        this.error =
          err.error?.message ||
          'Une erreur est survenue lors de la modification de la session';
        this.saving = false;
        this.cdr.markForCheck();
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
