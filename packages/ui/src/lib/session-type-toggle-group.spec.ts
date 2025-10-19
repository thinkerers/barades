import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  SessionTypeFilter,
  SessionTypeToggleGroup,
} from './session-type-toggle-group';

describe('SessionTypeToggleGroup', () => {
  let component: SessionTypeToggleGroup;
  let fixture: ComponentFixture<SessionTypeToggleGroup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SessionTypeToggleGroup],
    }).compileComponents();

    fixture = TestBed.createComponent(SessionTypeToggleGroup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('marks the selected session type as active', () => {
    fixture.componentRef.setInput('sessionType', 'online');
    fixture.detectChanges();

    const onlineButton = fixture.debugElement.query(
      By.css('[data-session-type="online"]')
    );

    expect(
      onlineButton.nativeElement.classList.contains(
        'session-type-toggle-group__toggle--active'
      )
    ).toBe(true);
  });

  it.each<SessionTypeFilter>(['all', 'online', 'onsite'] as const)(
    'emits the selected session type when choosing %s',
    (type) => {
      const emitSpy = jest.spyOn(component.sessionTypeChange, 'emit');
      const targetButton = fixture.debugElement.query(
        By.css(`[data-session-type="${type}"]`)
      );

      targetButton.nativeElement.click();

      expect(emitSpy).toHaveBeenCalledWith(type);
    }
  );
});
