import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Group } from '../../core/services/groups.service';

@Component({
  selector: 'app-group-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './group-card.html',
  styleUrl: './group-card.css'
})
export class GroupCardComponent {
  @Input({ required: true }) group!: Group;

  getPlaystyleLabel(playstyle: string): string {
    const labels: Record<string, string> = {
      'COMPETITIVE': 'Compétitif',
      'CASUAL': 'Décontracté',
      'STORY_DRIVEN': 'Narratif',
      'SANDBOX': 'Bac à sable'
    };
    return labels[playstyle] || playstyle;
  }

  getPlaystyleColor(playstyle: string): string {
    const colors: Record<string, string> = {
      'COMPETITIVE': 'red',
      'CASUAL': 'green',
      'STORY_DRIVEN': 'purple',
      'SANDBOX': 'blue'
    };
    return colors[playstyle] || 'gray';
  }

  getMemberCount(): number {
    return this.group._count?.members || 0;
  }

  isFull(): boolean {
    if (!this.group.maxMembers) return false;
    return this.getMemberCount() >= this.group.maxMembers;
  }

  getStatusLabel(): string {
    if (this.isFull()) return 'Complet';
    if (this.group.isRecruiting) return 'Recrute';
    return 'Privé';
  }

  getStatusClass(): string {
    if (this.isFull()) return 'status--full';
    if (this.group.isRecruiting) return 'status--recruiting';
    return 'status--private';
  }
}
