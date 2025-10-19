import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCheckbox } from '@angular/material/checkbox';
import { By } from '@angular/platform-browser';
import { SessionAvailabilityToggle } from './session-availability-toggle';

describe('SessionAvailabilityToggle', () => {
  let component: SessionAvailabilityToggle;
  let fixture: ComponentFixture<SessionAvailabilityToggle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SessionAvailabilityToggle],
    }).compileComponents();

    fixture = TestBed.createComponent(SessionAvailabilityToggle);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit when availability changes', () => {
    const emitSpy = jest.spyOn(component.availabilityChange, 'emit');
    const checkbox = fixture.debugElement.query(By.directive(MatCheckbox));

    checkbox.triggerEventHandler('change', { checked: true });

    expect(emitSpy).toHaveBeenCalledWith(true);
  });

  it('should reflect checked state from input', () => {
    fixture.componentRef.setInput('onlyAvailable', true);
    fixture.detectChanges();

    const checkbox = fixture.debugElement.query(By.directive(MatCheckbox));

    expect(checkbox.componentInstance.checked).toBe(true);
  });
});
