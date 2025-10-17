import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContactPage } from './contact-page';

describe('ContactPage', () => {
  let component: ContactPage;
  let fixture: ComponentFixture<ContactPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactPage],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactPage);
    component = fixture.componentInstance;

    // Mock initMap to prevent Leaflet initialization in tests
    jest
      .spyOn<ContactPage, never>(component, 'initMap' as never)
      .mockImplementation();

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the page title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const title = compiled.querySelector('.contact-title');

    expect(title?.textContent).toContain('Nous Contacter');
  });

  it('should display the subtitle', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const subtitle = compiled.querySelector('.contact-subtitle');

    expect(subtitle?.textContent).toContain('Une question');
  });

  it('should initialize form with empty values', () => {
    expect(component.contactForm.value).toEqual({
      name: '',
      email: '',
      subject: '',
      message: '',
    });
  });

  it('should have required validators on all fields', () => {
    const form = component.contactForm;

    expect(form.get('name')?.hasError('required')).toBe(true);
    expect(form.get('email')?.hasError('required')).toBe(true);
    expect(form.get('subject')?.hasError('required')).toBe(true);
    expect(form.get('message')?.hasError('required')).toBe(true);
  });

  it('should validate email format', () => {
    const emailControl = component.contactForm.get('email');

    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBe(true);

    emailControl?.setValue('valid@email.com');
    expect(emailControl?.hasError('email')).toBe(false);
  });

  it('should validate minimum length for name', () => {
    const nameControl = component.contactForm.get('name');

    nameControl?.setValue('A');
    expect(nameControl?.hasError('minlength')).toBe(true);

    nameControl?.setValue('Alice');
    expect(nameControl?.hasError('minlength')).toBe(false);
  });

  it('should validate minimum length for subject', () => {
    const subjectControl = component.contactForm.get('subject');

    subjectControl?.setValue('AB');
    expect(subjectControl?.hasError('minlength')).toBe(true);

    subjectControl?.setValue('Test Subject');
    expect(subjectControl?.hasError('minlength')).toBe(false);
  });

  it('should validate minimum length for message', () => {
    const messageControl = component.contactForm.get('message');

    messageControl?.setValue('Short');
    expect(messageControl?.hasError('minlength')).toBe(true);

    messageControl?.setValue('This is a valid message');
    expect(messageControl?.hasError('minlength')).toBe(false);
  });

  it('should render all form fields', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('#name')).toBeTruthy();
    expect(compiled.querySelector('#email')).toBeTruthy();
    expect(compiled.querySelector('#subject')).toBeTruthy();
    expect(compiled.querySelector('#message')).toBeTruthy();
  });

  it('should render submit button', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('.submit-button');

    expect(button).toBeTruthy();
    expect(button?.textContent).toContain('Envoyer le message');
  });

  it('should not submit when form is invalid', () => {
    jest.spyOn(console, 'log');
    component.onSubmit();

    expect(component.submitted).toBe(true);
    expect(console.log).not.toHaveBeenCalled();
    expect(component.errorMessage).toBe(
      'Veuillez corriger les erreurs dans le formulaire.'
    );
    expect(component.successMessage).toBe('');
  });

  it('should submit when form is valid', () => {
    jest.spyOn(console, 'log');

    component.contactForm.setValue({
      name: 'Alice',
      email: 'alice@example.com',
      subject: 'Test Subject',
      message: 'This is a test message',
    });

    component.onSubmit();

    expect(component.submitted).toBe(false); // Reset après succès
    expect(console.log).toHaveBeenCalledWith('Form submitted:', {
      name: 'Alice',
      email: 'alice@example.com',
      subject: 'Test Subject',
      message: 'This is a test message',
    });
    expect(component.successMessage).toBe(
      'Merci pour votre message ! Nous vous répondrons dans les plus brefs délais.'
    );
    expect(component.errorMessage).toBe('');
  });

  it('should reset form after successful submission', () => {
    component.contactForm.setValue({
      name: 'Alice',
      email: 'alice@example.com',
      subject: 'Test Subject',
      message: 'This is a test message',
    });

    component.onSubmit();

    expect(component.contactForm.value).toEqual({
      name: null,
      email: null,
      subject: null,
      message: null,
    });
  });

  it('should display contact information', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Bar à Dés HQ');
    expect(compiled.textContent).toContain('Grand Place, 7500 Tournai');
    expect(compiled.textContent).toContain('Belgique');
    expect(compiled.textContent).toContain('contact@barades.com');
  });

  it('should have email link with correct href', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const emailLink = compiled.querySelector(
      'a[href="mailto:contact@barades.com"]'
    );

    expect(emailLink).toBeTruthy();
  });

  it('should have map container element', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const mapContainer = compiled.querySelector('#contact-map');

    expect(mapContainer).toBeTruthy();
    expect(mapContainer?.classList.contains('contact-map')).toBe(true);
  });

  it('should show error messages when submitted with invalid data', () => {
    component.onSubmit();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const errorMessages = compiled.querySelectorAll('.error-message');

    expect(errorMessages.length).toBeGreaterThan(0);
  });

  it('should clear error message on successful submission', () => {
    component.errorMessage = 'Some error';
    component.contactForm.setValue({
      name: 'Alice',
      email: 'alice@example.com',
      subject: 'Test Subject',
      message: 'This is a test message',
    });

    component.onSubmit();

    expect(component.errorMessage).toBe('');
  });
});
