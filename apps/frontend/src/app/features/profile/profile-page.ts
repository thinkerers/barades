import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
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
})
export class ProfilePage implements OnInit {
  private authService = inject(AuthService);
  private usersService = inject(UsersService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  user: User | null = null;
  profileForm: FormGroup;
  isEditing = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

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
    this.loadProfile();
  }

  private loadProfile(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.usersService.getMyProfile().subscribe({
      next: (profile) => {
        this.isLoading = false;
        this.user = {
          id: profile.id,
          email: profile.email,
          username: profile.username,
          firstName: profile.firstName,
          lastName: profile.lastName,
          bio: profile.bio,
          avatar: profile.avatar,
        };

        // Populate form with current user data
        this.profileForm.patchValue({
          username: profile.username,
          email: profile.email,
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          bio: profile.bio || '',
          skillLevel: profile.skillLevel || '',
        });
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage =
          err.error?.message || 'Erreur lors du chargement du profil';
        console.error('Profile load error:', err);
        this.cdr.markForCheck();
      },
    });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;

    if (!this.isEditing) {
      // Cancel editing - reset form with fresh data
      this.loadProfile();
      this.errorMessage = '';
      this.successMessage = '';
    }
    this.cdr.markForCheck();
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.cdr.markForCheck();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.markForCheck();

    const dto: UpdateProfileDto = {
      firstName: this.profileForm.value.firstName || undefined,
      lastName: this.profileForm.value.lastName || undefined,
      bio: this.profileForm.value.bio || undefined,
      skillLevel: this.profileForm.value.skillLevel || undefined,
    };

    this.usersService.updateMyProfile(dto).subscribe({
      next: (updatedUser) => {
        this.isLoading = false;
        this.successMessage = 'Profil mis à jour avec succès !';
        this.isEditing = false;

        // Update local user data
        this.user = {
          id: updatedUser.id,
          email: updatedUser.email,
          username: updatedUser.username,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          bio: updatedUser.bio,
          avatar: updatedUser.avatar,
        };

        // Update form with new data
        this.profileForm.patchValue({
          firstName: updatedUser.firstName || '',
          lastName: updatedUser.lastName || '',
          bio: updatedUser.bio || '',
          skillLevel: updatedUser.skillLevel || '',
        });
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage =
          err.error?.message || 'Erreur lors de la mise à jour du profil';
        console.error('Profile update error:', err);
        this.cdr.markForCheck();
      },
    });
  }

  logout(): void {
    this.authService.logout();
  }

  getInitials(): string {
    if (!this.user) return '?';

    const firstInitial =
      this.user.firstName?.charAt(0) || this.user.username.charAt(0);
    const lastInitial = this.user.lastName?.charAt(0) || '';

    return (firstInitial + lastInitial).toUpperCase();
  }
}
