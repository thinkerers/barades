import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { User } from '../../core/models/auth.model';
import { AuthService } from '../../core/services/auth.service';
import {
  UpdateProfileDto,
  UsersService,
} from '../../core/services/users.service';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePage implements OnInit {
  private authService = inject(AuthService);
  private usersService = inject(UsersService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private readonly userSignal = signal<User | null>(null);
  readonly profileForm: FormGroup;
  private readonly isEditingSignal = signal(false);
  private readonly isLoadingSignal = signal(false);
  private readonly errorMessageSignal = signal('');
  private readonly successMessageSignal = signal('');

  skillLevels = [
    { value: 'BEGINNER', label: 'Débutant' },
    { value: 'INTERMEDIATE', label: 'Intermédiaire' },
    { value: 'EXPERT', label: 'Expert' },
  ];

  constructor() {
    this.profileForm = this.fb.group({
      username: [{ value: '', disabled: true }],
      email: [{ value: '', disabled: true }],
      firstName: [''],
      lastName: [''],
      bio: ['', [Validators.maxLength(500)]],
      skillLevel: [''],
    });
  }

  ngOnInit(): void {
    // Check authentication first
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    // Load fresh profile data from API
    void this.loadProfile();
  }

  private async loadProfile(): Promise<void> {
    this.isLoadingSignal.set(true);
    this.errorMessageSignal.set('');

    try {
      const profile = await firstValueFrom(this.usersService.getMyProfile());
      if (!profile) {
        throw new Error('Profil introuvable');
      }

      this.userSignal.set({
        id: profile.id,
        email: profile.email,
        username: profile.username,
        firstName: profile.firstName,
        lastName: profile.lastName,
        bio: profile.bio,
        avatar: profile.avatar,
      });

      this.profileForm.patchValue({
        username: profile.username,
        email: profile.email,
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        bio: profile.bio || '',
        skillLevel: profile.skillLevel || '',
      });
      this.isLoadingSignal.set(false);
    } catch (error) {
      console.error('Profile load error:', error);
      const message =
        (error as { error?: { message?: string } })?.error?.message ||
        'Erreur lors du chargement du profil';
      this.errorMessageSignal.set(message);
      this.isLoadingSignal.set(false);
    }
  }

  async toggleEdit(): Promise<void> {
    const nextState = !this.isEditingSignal();
    this.isEditingSignal.set(nextState);

    if (!nextState) {
      this.errorMessageSignal.set('');
      this.successMessageSignal.set('');
      await this.loadProfile();
    }
  }

  async onSubmit(): Promise<void> {
    if (this.profileForm.invalid) {
      return;
    }

    this.isLoadingSignal.set(true);
    this.errorMessageSignal.set('');
    this.successMessageSignal.set('');

    const dto: UpdateProfileDto = {
      firstName: this.profileForm.value.firstName || undefined,
      lastName: this.profileForm.value.lastName || undefined,
      bio: this.profileForm.value.bio || undefined,
      skillLevel: this.profileForm.value.skillLevel || undefined,
    };

    try {
      const updatedUser = await firstValueFrom(
        this.usersService.updateMyProfile(dto)
      );

      this.isLoadingSignal.set(false);
      this.successMessageSignal.set('Profil mis à jour avec succès !');
      this.isEditingSignal.set(false);

      this.userSignal.set({
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        bio: updatedUser.bio,
        avatar: updatedUser.avatar,
      });

      this.profileForm.patchValue({
        firstName: updatedUser.firstName || '',
        lastName: updatedUser.lastName || '',
        bio: updatedUser.bio || '',
        skillLevel: updatedUser.skillLevel || '',
      });
    } catch (error) {
      console.error('Profile update error:', error);
      const message =
        (error as { error?: { message?: string } })?.error?.message ||
        'Erreur lors de la mise à jour du profil';
      this.errorMessageSignal.set(message);
      this.isLoadingSignal.set(false);
    }
  }

  logout(): void {
    this.authService.logout();
  }

  getInitials(): string {
    const user = this.userSignal();
    if (!user) {
      return '?';
    }

    const firstInitial = user.firstName?.charAt(0) || user.username.charAt(0);
    const lastInitial = user.lastName?.charAt(0) || '';

    return (firstInitial + lastInitial).toUpperCase();
  }

  get user(): User | null {
    return this.userSignal();
  }

  get isEditing(): boolean {
    return this.isEditingSignal();
  }

  get isLoading(): boolean {
    return this.isLoadingSignal();
  }

  get errorMessage(): string {
    return this.errorMessageSignal();
  }

  get successMessage(): string {
    return this.successMessageSignal();
  }
}
