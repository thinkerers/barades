import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GroupsService, Group } from '../../core/services/groups.service';
import { GroupCardComponent } from './group-card';

@Component({
  selector: 'app-groups-list',
  standalone: true,
  imports: [CommonModule, GroupCardComponent],
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

  retry(): void {
    this.loadGroups();
  }
}
