import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIcon } from '@angular/material/icon';
import { By } from '@angular/platform-browser';
import { ErrorMessageComponent } from './error-message';

describe('ErrorMessageComponent', () => {
  let component: ErrorMessageComponent;
  let fixture: ComponentFixture<ErrorMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorMessageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorMessageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Message Display', () => {
    it('should display error message', () => {
      component.message = 'Something went wrong';
      fixture.detectChanges();

      const errorText = fixture.nativeElement.querySelector('.error-text');
      expect(errorText).toBeTruthy();
      expect(errorText.textContent).toBe('Something went wrong');
    });

    it('should display empty message when not provided', () => {
      fixture.detectChanges();

      const errorText = fixture.nativeElement.querySelector('.error-text');
      expect(errorText).toBeTruthy();
      expect(errorText.textContent).toBe('');
    });
  });

  describe('Icon Display', () => {
    it('should render Material icon by default', () => {
      fixture.detectChanges();

      const iconDebug = fixture.debugElement.query(By.directive(MatIcon));
      expect(iconDebug).toBeTruthy();
      const iconEl = iconDebug.nativeElement as HTMLElement;
      expect(iconEl.classList.contains('error-icon')).toBe(true);
      expect(iconEl.tagName.toLowerCase()).toBe('mat-icon');
    });

    it('should set accessibility attributes on icon', () => {
      fixture.detectChanges();

      const iconEl = fixture.nativeElement.querySelector('.error-icon');
      expect(iconEl).toBeTruthy();
      expect(iconEl.getAttribute('aria-hidden')).toBe('true');
      expect(iconEl.getAttribute('role')).toBe('presentation');
    });
  });

  describe('Action Button', () => {
    it('should not display action button when actionLabel is not provided', () => {
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('.error-action');
      expect(button).toBeFalsy();
    });

    it('should display action button when actionLabel is provided', () => {
      component.actionLabel = 'Retry';
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('.error-action');
      expect(button).toBeTruthy();
      expect(button.textContent.trim()).toBe('Retry');
    });

    it('should have correct aria-label', () => {
      component.actionLabel = 'Try Again';
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('.error-action');
      expect(button.getAttribute('aria-label')).toBe('Try Again');
    });

    it('should emit action event when button is clicked', () => {
      component.actionLabel = 'Retry';
      fixture.detectChanges();

      const emitSpy = jest.spyOn(component.action, 'emit');
      const button = fixture.nativeElement.querySelector('.error-action');

      button.click();

      expect(emitSpy).toHaveBeenCalledTimes(1);
    });

    it('should have button type="button"', () => {
      component.actionLabel = 'Retry';
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('.error-action');
      expect(button.getAttribute('type')).toBe('button');
    });
  });

  describe('Styling', () => {
    it('should have error-container class', () => {
      fixture.detectChanges();

      const container = fixture.nativeElement.querySelector('.error-container');
      expect(container).toBeTruthy();
    });

    it('should have error-text class on message', () => {
      component.message = 'Test error';
      fixture.detectChanges();

      const errorText = fixture.nativeElement.querySelector('.error-text');
      expect(errorText.classList.contains('error-text')).toBe(true);
    });
  });

  describe('Integration', () => {
    it('should render complete error state with action', () => {
      component.message = 'Failed to load data';
      component.actionLabel = 'Reload';
      fixture.detectChanges();

      const container = fixture.nativeElement.querySelector('.error-container');
      const icon = container.querySelector('.error-icon');
      const text = container.querySelector('.error-text');
      const button = container.querySelector('.error-action');

      expect(icon).toBeTruthy();
      expect(text.textContent).toBe('Failed to load data');
      expect(button.textContent.trim()).toBe('Reload');
    });

    it('should render error state without action', () => {
      component.message = 'Something went wrong';
      fixture.detectChanges();

      const container = fixture.nativeElement.querySelector('.error-container');
      const icon = container.querySelector('.error-icon');
      const text = container.querySelector('.error-text');
      const button = container.querySelector('.error-action');

      expect(icon).toBeTruthy();
      expect(text.textContent).toBe('Something went wrong');
      expect(button).toBeFalsy();
    });
  });
});
