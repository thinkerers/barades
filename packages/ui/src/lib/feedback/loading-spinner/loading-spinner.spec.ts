import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingSpinnerComponent } from './loading-spinner';

describe('LoadingSpinnerComponent', () => {
  let component: LoadingSpinnerComponent;
  let fixture: ComponentFixture<LoadingSpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingSpinnerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render spinner', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.spinner')).toBeTruthy();
  });

  it('should display message when provided', () => {
    fixture = TestBed.createComponent(LoadingSpinnerComponent);
    component = fixture.componentInstance;
    component.message = 'Loading data...';
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const message = compiled.querySelector('.loading-spinner__message');

    expect(message).toBeTruthy();
    expect(message?.textContent).toContain('Loading data...');
  });
  it('should not display message when not provided', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const message = compiled.querySelector('.loading-spinner__message');

    expect(message).toBeFalsy();
  });
});
