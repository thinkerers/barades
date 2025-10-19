import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'lib-sessions-scope-banner',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './sessions-scope-banner.html',
  styleUrl: './sessions-scope-banner.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionsScopeBanner {
  @ViewChild('banner', { static: true })
  private bannerElement?: ElementRef<HTMLDivElement>;

  @Input({ required: true }) message!: string;
  @Input() leadingIcon = 'person';
  @Input() backActionIcon = 'arrow_back';
  @Input() clearActionIcon: string | null = null;
  @Input() showBackAction = false;
  @Input() backActionLabel = 'Retour au dashboard';
  @Input() clearActionLabel = 'Voir toutes les sessions';
  @Input() disableClearAction = false;

  @Output() backAction = new EventEmitter<void>();
  @Output() clearAction = new EventEmitter<void>();

  focus(): void {
    this.bannerElement?.nativeElement.focus();
  }

  onBackAction(): void {
    if (!this.showBackAction) {
      return;
    }

    this.backAction.emit();
  }
}
