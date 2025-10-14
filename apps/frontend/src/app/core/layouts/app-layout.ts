import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideNav } from '../navigation/side-nav';
import { TopBar } from '../navigation/top-bar';
import { Footer } from '../navigation/footer';

@Component({
  standalone: true,
  imports: [RouterOutlet, TopBar, SideNav, Footer],
  selector: 'app-app-layout',
  templateUrl: './app-layout.html',
  styleUrl: './app-layout.css',
})
export class AppLayout {}
