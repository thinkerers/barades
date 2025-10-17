import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AboutPage } from './about-page';

describe('AboutPage', () => {
  let component: AboutPage;
  let fixture: ComponentFixture<AboutPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutPage],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AboutPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the page title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const title = compiled.querySelector('.about-title');

    expect(title?.textContent).toContain('À Propos de');
    expect(title?.textContent).toContain('Bar à Dés');
  });

  it('should display the subtitle', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const subtitle = compiled.querySelector('.about-subtitle');

    expect(subtitle?.textContent).toContain('Notre mission');
  });

  it('should render 3 team members', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const teamMembers = compiled.querySelectorAll('.team-member');

    expect(teamMembers.length).toBe(3);
  });

  it('should display team member names', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const memberNames = compiled.querySelectorAll('.member-name');
    const names = Array.from(memberNames).map((el) => el.textContent?.trim());

    expect(names).toContain('Élise');
    expect(names).toContain('Léo');
    expect(names).toContain('Chloé');
  });

  it('should display team member roles', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const memberRoles = compiled.querySelectorAll('.member-role');
    const roles = Array.from(memberRoles).map((el) => el.textContent?.trim());

    expect(roles).toContain('Fondatrice & MJ Éternelle');
    expect(roles).toContain('Développeur & Barde Codeur');
    expect(roles).toContain('Community Manager & Clerc');
  });

  it('should display mission section with icon', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const missionTitle = compiled.querySelector('.section-title');
    const missionIcon = compiled.querySelector('.section-icon');

    expect(missionTitle?.textContent).toContain('Notre Mission');
    expect(missionIcon).toBeTruthy();
  });

  it('should display mission text', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const missionText = compiled.querySelector('.section-text');

    expect(missionText?.textContent).toContain('Chez Bar à Dés');
    expect(missionText?.textContent).toContain('jeu de rôle');
  });

  it('should render CTA section', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const ctaSection = compiled.querySelector('.about-cta');
    const ctaTitle = compiled.querySelector('.cta-title');

    expect(ctaSection).toBeTruthy();
    expect(ctaTitle?.textContent).toContain("Rejoignez l'Aventure");
  });

  it('should have link to sessions page', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const ctaButton = compiled.querySelector('.cta-button');

    expect(ctaButton).toBeTruthy();
    expect(ctaButton?.getAttribute('href')).toBe('/sessions');
  });

  it('should display CTA button text', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const ctaButton = compiled.querySelector('.cta-button span');

    expect(ctaButton?.textContent).toContain('Trouver une partie');
  });
});
