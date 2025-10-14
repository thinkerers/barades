import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { GroupsService, Group } from '../../core/services/groups.service';

@Component({
  selector: 'app-groups-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './groups-list.html',
  styleUrl: './groups-list.css'
})
export class GroupsListComponent implements OnInit {
  private groupsService = inject(GroupsService);
  
  groups: Group[] = [];
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.loadGroups();
  }

  private loadGroups(): void {
    this.loading = true;
    this.error = null;

    this.groupsService.getGroups().subscribe({
      next: (data) => {
        this.groups = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading groups:', err);
        this.error = 'Impossible de charger les groupes. Veuillez réessayer.';
        this.loading = false;
      }
    });
  }

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

  retry(): void {
    this.loadGroups();
  }
}
