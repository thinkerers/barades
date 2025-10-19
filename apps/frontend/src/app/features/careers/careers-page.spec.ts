import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CareersPage } from './careers-page';

describe('CareersPage', () => {
  let component: CareersPage;
  let fixture: ComponentFixture<CareersPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CareersPage],
    }).compileComponents();

    fixture = TestBed.createComponent(CareersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render all job openings', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll('.opening-card');

    expect(cards.length).toBe(component.jobOpenings.length);
  });

  it('should expose mailto links for applications', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const links = Array.from(
      compiled.querySelectorAll<HTMLAnchorElement>('.opening-cta')
    ).map((anchor) => anchor.getAttribute('href'));

    expect(links.length).toBeGreaterThan(0);
    links.forEach((href) => {
      expect(href).toContain('mailto:talents@barades.com');
      expect(href).toContain('subject=');
    });
  });

  it('should build a formatted mailto url', () => {
    const url = component.buildMailto('Sujet de test');

    expect(url.startsWith('mailto:')).toBe(true);
    expect(url).toContain('Sujet%20de%20test');
    expect(url).toContain('Au%20plaisir%20de%20discuter');
  });
});
