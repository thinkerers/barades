import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);

  private readonly defaultConfig: MatSnackBarConfig = {
    duration: 5000,
    horizontalPosition: 'right',
    verticalPosition: 'bottom',
  };

  success(message: string, config?: MatSnackBarConfig): void {
    this.open(message, 'toast-success', config);
  }

  error(message: string, config?: MatSnackBarConfig): void {
    this.open(message, 'toast-error', config);
  }

  info(message: string, config?: MatSnackBarConfig): void {
    this.open(message, 'toast-info', config);
  }

  private open(
    message: string,
    toneClass: string,
    config?: MatSnackBarConfig
  ): void {
    const finalConfig = this.mergeConfig(toneClass, config);
    this.snackBar.open(message, 'Fermer', finalConfig);
  }

  private mergeConfig(
    toneClass: string,
    config?: MatSnackBarConfig
  ): MatSnackBarConfig {
    const mergedClasses = Array.from(
      new Set(
        ['toast-base', toneClass, ...this.toArray(config?.panelClass)].filter(
          Boolean
        )
      )
    ) as string[];

    return {
      ...this.defaultConfig,
      ...config,
      panelClass: mergedClasses,
    };
  }

  private toArray(panelClass?: string | string[]): string[] {
    if (!panelClass) {
      return [];
    }

    return Array.isArray(panelClass) ? panelClass : [panelClass];
  }
}
