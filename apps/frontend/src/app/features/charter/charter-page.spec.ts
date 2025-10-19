import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CharterPage } from './charter-page';

describe('CharterPage', () => {
  let component: CharterPage;
  let fixture: ComponentFixture<CharterPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CharterPage],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(CharterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render every charter principle', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll('.charter-card');

    expect(cards.length).toBe(component.principles.length);
  });

  it('should highlight the consequences card', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const highlighted = compiled.querySelector('.charter-card--highlight');

    expect(highlighted).toBeTruthy();
    expect(highlighted?.textContent).toContain('Conséquences');
  });

  it('should provide a link to the contact page in the callout', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const calloutLink = compiled.querySelector('.charter-callout a');

    expect(calloutLink?.getAttribute('href')).toBe('/contact');
  });
});
