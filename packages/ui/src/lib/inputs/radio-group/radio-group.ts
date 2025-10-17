import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

export interface RadioOption {
  value: string;
  label: string;
  icon?: string;
}

@Component({
  selector: 'lib-radio-group',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './radio-group.html',
  styleUrls: ['./radio-group.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioGroupComponent {
  @Input() options: RadioOption[] = [];
  @Input() value = '';
  @Input() name = 'radio-group';
  @Output() valueChange = new EventEmitter<string>();

  selectOption(optionValue: string): void {
    this.valueChange.emit(optionValue);
  }

  isSelected(optionValue: string): boolean {
    return this.value === optionValue;
  }
}
