import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import {
  CreateGroupData,
  GroupsService,
} from '../../core/services/groups.service';
import { SessionsService } from '../../core/services/sessions.service';

@Component({
  selector: 'app-group-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './group-create.html',
  styleUrls: ['./group-create.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupCreateComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly groupsService = inject(GroupsService);
  private readonly sessionsService = inject(SessionsService);
  private readonly authService = inject(AuthService);

  groupForm!: FormGroup;
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  // Liste des jeux existants pour l'autocomplétion
  readonly existingGames = signal<string[]>([]);

  // Jeux sélectionnés
  readonly selectedGames = signal<string[]>([]);

  playstyles = [
    { value: 'CASUAL', label: 'Casual - Détendu et convivial' },
    { value: 'COMPETITIVE', label: 'Compétitif - Stratégique et engagé' },
    { value: 'STORY_DRIVEN', label: 'Narratif - Immersif et roleplay' },
    { value: 'SOCIAL', label: 'Social - Convivialité avant tout' },
  ];

  constructor() {
    // Vérifier si l'utilisateur est connecté
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: '/groups/new' },
      });
      return;
    }

    this.groupForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      gameInput: [''], // Champ de saisie pour les jeux
      location: ['', [Validators.required, Validators.minLength(2)]],
      playstyle: ['SOCIAL', Validators.required],
      description: ['', [Validators.required, Validators.minLength(10)]],
      recruiting: [true],
      isPublic: [true],
    });
  }

  ngOnInit(): void {
    void this.loadExistingGames();
  }

  private async loadExistingGames(): Promise<void> {
    try {
      const sessions = await firstValueFrom(
        this.sessionsService.getSessions()
      );
      const games = [...new Set(sessions.map((s) => s.game))];
      this.existingGames.set(games);
    } catch {
      // Silently fail - autocomplete just won't work
    }
  }

  addGame(): void {
    const gameInput = this.groupForm.get('gameInput');
    const game = gameInput?.value?.trim();
    if (game && !this.selectedGames().includes(game)) {
      this.selectedGames.update((games) => [...games, game]);
      gameInput?.setValue('');
    }
  }

  removeGame(game: string): void {
    this.selectedGames.update((games) => games.filter((g) => g !== game));
  }

  onGameInputKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addGame();
    }
  }

  async onSubmit(): Promise<void> {
    if (this.groupForm.invalid) {
      Object.keys(this.groupForm.controls).forEach((key) => {
        const control = this.groupForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    if (this.selectedGames().length === 0) {
      this.error.set('Veuillez ajouter au moins un jeu');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const formValue = this.groupForm.value;
    const groupData: CreateGroupData = {
      name: formValue.name,
      games: this.selectedGames(),
      location: formValue.location,
      playstyle: formValue.playstyle,
      description: formValue.description,
      recruiting: formValue.recruiting,
      isPublic: formValue.isPublic,
    };

    try {
      const group = await firstValueFrom(
        this.groupsService.createGroup(groupData)
      );
      console.log('Groupe créé:', group);
      this.router.navigate(['/groups', group.id]);
    } catch (err: unknown) {
      console.error('Erreur création groupe:', err);
      this.error.set(
        (err as { error?: { message?: string } })?.error?.message ||
          'Erreur lors de la création du groupe'
      );
    } finally {
      this.loading.set(false);
    }
  }

  cancel(): void {
    this.router.navigate(['/groups']);
  }

  getErrorMessage(field: string): string {
    const control = this.groupForm.get(field);
    if (!control?.touched || !control.errors) return '';

    if (control.errors['required']) return 'Ce champ est requis';
    if (control.errors['minlength'])
      return `Minimum ${control.errors['minlength'].requiredLength} caractères`;

    return 'Champ invalide';
  }
}
