import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Footer } from './footer';

describe('Footer', () => {
  let component: Footer;
  let fixture: ComponentFixture<Footer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Footer],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Footer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display current year', () => {
    const currentYear = new Date().getFullYear();
    expect(component.currentYear).toBe(currentYear);

    const compiled = fixture.nativeElement as HTMLElement;
    const copyright = compiled.querySelector('.footer-copyright');
    expect(copyright?.textContent).toContain(currentYear.toString());
  });

  it('should render footer sections', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const sections = compiled.querySelectorAll('.footer-section');
    expect(sections.length).toBe(4); // Bar à Dés, Communauté, Ressources, Développeurs
  });

  it('should render social links', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const socialLinks = compiled.querySelectorAll('.footer-social-link');
    expect(socialLinks.length).toBe(4); // Twitter, Instagram, Facebook, Discord
  });
});
