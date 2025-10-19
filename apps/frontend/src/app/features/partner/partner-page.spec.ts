import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PartnerPage } from './partner-page';

describe('PartnerPage', () => {
  let component: PartnerPage;
  let fixture: ComponentFixture<PartnerPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartnerPage],
    }).compileComponents();

    fixture = TestBed.createComponent(PartnerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should mark form invalid when fields are empty', () => {
    component.onSubmit();

    expect(component.partnerForm.invalid).toBe(true);
    expect(component.errorMessage).toContain('Veuillez');
  });

  it('should accept valid submissions and reset the form', () => {
    component.partnerForm.setValue({
      organization: 'Le Dé Pipé',
      contactName: 'Élise Dupont',
      email: 'elise@example.com',
      message: 'Nous souhaitons organiser des soirées découverte chaque mois.',
    });

    component.onSubmit();

    expect(component.errorMessage).toBe('');
    expect(component.successMessage).toContain('Merci');
    expect(component.partnerForm.pristine).toBe(true);
  });
});
