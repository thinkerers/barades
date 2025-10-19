import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from '../navigation/footer';
import { TopBar } from '../navigation/top-bar';

@Component({
  standalone: true,
  imports: [RouterOutlet, TopBar, Footer],
  selector: 'app-app-layout',
  templateUrl: './app-layout.html',
  styleUrl: './app-layout.css',
})
export class AppLayout {}
