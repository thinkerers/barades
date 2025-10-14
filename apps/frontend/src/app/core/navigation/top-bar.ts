import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-top-bar',
  templateUrl: './top-bar.html',
  styleUrl: './top-bar.css',
})
export class TopBar {}
