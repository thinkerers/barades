import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmptyStateComponent } from './empty-state';

describe('EmptyStateComponent', () => {
  let component: EmptyStateComponent;
  let fixture: ComponentFixture<EmptyStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyStateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EmptyStateComponent);
    component = fixture.componentInstance;
    component.message = 'No results found';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display message', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const message = compiled.querySelector('.empty-state__message');

    expect(message).toBeTruthy();
    expect(message?.textContent).toContain('No results found');
  });

  it('should display action button when actionLabel is provided', () => {
    fixture = TestBed.createComponent(EmptyStateComponent);
    component = fixture.componentInstance;
    component.message = 'No results';
    component.actionLabel = 'Reset Filters';
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('button');

    expect(button).toBeTruthy();
    expect(button?.textContent?.trim()).toBe('Reset Filters');
  });
  it('should not display action button when actionLabel is not provided', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('button');

    expect(button).toBeFalsy();
  });

  it('should emit action event when button is clicked', () => {
    fixture = TestBed.createComponent(EmptyStateComponent);
    component = fixture.componentInstance;
    component.message = 'No results';
    component.actionLabel = 'Reset';
    fixture.detectChanges();

    jest.spyOn(component.action, 'emit');

    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('button') as HTMLButtonElement;
    button.click();

    expect(component.action.emit).toHaveBeenCalled();
  });

  it('should apply custom button class', () => {
    fixture = TestBed.createComponent(EmptyStateComponent);
    component = fixture.componentInstance;
    component.message = 'No results';
    component.actionLabel = 'Reset';
    component.buttonClass = 'custom-button';
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('button');

    expect(button?.className).toContain('custom-button');
  });
});
