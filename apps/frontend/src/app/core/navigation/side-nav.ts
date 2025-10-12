import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-side-nav',
  templateUrl: './side-nav.html',
  styleUrl: './side-nav.css',
})
export class SideNav {}
