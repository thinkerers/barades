import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HelpPage } from './help-page';

describe('HelpPage', () => {
  let component: HelpPage;
  let fixture: ComponentFixture<HelpPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HelpPage],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(HelpPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display FAQ items by default', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const faqs = compiled.querySelectorAll('.faq-item');

    expect(faqs.length).toBe(component.faqs.length);
  });

  it('should filter FAQs when searching', () => {
    component.searchTerm = 'mot de passe';
    fixture.detectChanges();

    expect(component.filteredFaqs.length).toBeGreaterThan(0);
    expect(
      component.filteredFaqs.every(
        (faq) =>
          faq.question.toLowerCase().includes('mot de passe') ||
          faq.answer.toLowerCase().includes('mot de passe')
      )
    ).toBe(true);
  });

  it('should display the empty state when no FAQ matches', () => {
    component.searchTerm = 'element introuvable';
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const emptyState = compiled.querySelector('.faq-empty');

    expect(component.hasResults).toBe(false);
    expect(emptyState).toBeTruthy();
  });
});
