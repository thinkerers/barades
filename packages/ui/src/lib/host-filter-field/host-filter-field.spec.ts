import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HostFilterField } from './host-filter-field';

describe('HostFilterField', () => {
  let component: HostFilterField;
  let fixture: ComponentFixture<HostFilterField>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostFilterField],
    }).compileComponents();

    fixture = TestBed.createComponent(HostFilterField);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit hostFilterChange when the input value updates', () => {
    const emitSpy = jest.spyOn(component.hostFilterChange, 'emit');

    component.handleInputChange('Alice');

    expect(emitSpy).toHaveBeenCalledWith('Alice');
  });

  it('should emit hostFilterFocus when the field gains focus', () => {
    const emitSpy = jest.spyOn(component.hostFilterFocus, 'emit');

    component.handleInputFocus();

    expect(emitSpy).toHaveBeenCalledTimes(1);
  });

  it('should emit clearHostFilter when the clear button is clicked', () => {
    const emitSpy = jest.spyOn(component.clearHostFilter, 'emit');

    component.handleClearClick();

    expect(emitSpy).toHaveBeenCalledTimes(1);
  });

  it('should emit hostOptionSelected when an option is chosen', () => {
    const emitSpy = jest.spyOn(component.hostOptionSelected, 'emit');

    component.handleOptionSelected('Bob');

    expect(emitSpy).toHaveBeenCalledWith('Bob');
  });

  it('should toggle disabled state according to input values', () => {
    component.selectedHost = '';
    component.isScopeFilterActive = false;
    fixture.detectChanges();

    expect(component.isClearButtonDisabled).toBe(true);

    component.handleInputChange('Alice');

    expect(component.isClearButtonDisabled).toBe(false);

    component.handleClearClick();
    component.isScopeFilterActive = true;

    expect(component.isClearButtonDisabled).toBe(false);
  });
});
