import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'lib-session-availability-toggle',
  standalone: true,
  imports: [CommonModule, MatCheckboxModule],
  templateUrl: './session-availability-toggle.html',
  styleUrl: './session-availability-toggle.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionAvailabilityToggle {
  @Input() onlyAvailable = false;
  @Output() availabilityChange = new EventEmitter<boolean>();

  onAvailabilityChange(checked: boolean | undefined): void {
    this.availabilityChange.emit(!!checked);
  }
}
