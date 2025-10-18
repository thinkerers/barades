
import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import * as L from 'leaflet';

@Component({
  selector: 'app-contact-page',
  imports: [ReactiveFormsModule, MatIconModule],
  templateUrl: './contact-page.html',
  styleUrl: './contact-page.css',
})
export class ContactPage implements OnInit {
  private fb = inject(FormBuilder);

  contactForm: FormGroup;
  submitted = false;
  successMessage = '';
  errorMessage = '';
  private map: L.Map | null = null;

  constructor() {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required, Validators.minLength(3)]],
      message: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  ngOnInit(): void {
    // Initialize map after view is rendered
    setTimeout(() => {
      this.initMap();
    }, 100);
  }

  onSubmit(): void {
    this.submitted = true;
    this.successMessage = '';
    this.errorMessage = '';

    if (this.contactForm.invalid) {
      this.errorMessage = 'Veuillez corriger les erreurs dans le formulaire.';
      return;
    }

    // Simulate form submission
    const formData = this.contactForm.value;
    console.log('Form submitted:', formData);

    // In a real app, you would send this to a backend service
    // For now, just show success message
    this.successMessage =
      'Merci pour votre message ! Nous vous répondrons dans les plus brefs délais.';
    this.contactForm.reset();
    this.submitted = false;
  }

  get name() {
    return this.contactForm.get('name');
  }

  get email() {
    return this.contactForm.get('email');
  }

  get subject() {
    return this.contactForm.get('subject');
  }

  get message() {
    return this.contactForm.get('message');
  }

  private initMap(): void {
    const container = document.getElementById('contact-map');
    if (!container) {
      console.warn('[ContactPage] Map container not found');
      return;
    }

    // Avoid reinitializing if map already exists
    if (this.map) {
      this.map.remove();
      this.map = null;
    }

    // Set default icon path for Leaflet
    L.Icon.Default.imagePath = 'assets/leaflet/';

    // Coordinates for Grand Place, Tournai, Belgium
    const tournaiCoords: L.LatLngExpression = [50.6058, 3.3873];

    // Create map centered on Tournai
    this.map = L.map('contact-map', {
      center: tournaiCoords,
      zoom: 16,
      scrollWheelZoom: false,
      dragging: true,
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(this.map);

    // Create custom marker icon
    const customIcon = L.icon({
      iconUrl:
        'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
      shadowUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    // Add marker for Bar à Dés HQ
    const marker = L.marker(tournaiCoords, { icon: customIcon })
      .addTo(this.map)
      .bindPopup(
        `
        <div style="text-align: center; font-family: system-ui;">
          <strong style="font-size: 1.1em; color: #6366f1;">🎲 Bar à Dés HQ</strong><br>
          <span style="color: #64748b; font-size: 0.9em;">Grand Place, 7500 Tournai</span><br>
          <span style="color: #64748b; font-size: 0.9em;">Belgique</span><br>
          <br>
          <a href="mailto:contact@barades.com" style="color: #6366f1; text-decoration: none;">
            📧 contact@barades.com
          </a>
        </div>
      `,
        { closeButton: false }
      );

    // Open popup automatically
    marker.openPopup();

    // Force map to recognize container size
    this.map.whenReady(() => {
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize(true);
        }
      }, 100);
    });
  }
}
