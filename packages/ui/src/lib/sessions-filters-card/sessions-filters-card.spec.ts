import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HostFilterField } from '../host-filter-field/host-filter-field';
import { SearchFilterField } from '../search-filter-field/search-filter-field';
import { SessionAvailabilityToggle } from '../session-availability-toggle';
import { SessionTypeToggleGroup } from '../session-type-toggle-group';
import { SessionsFiltersCard } from './sessions-filters-card';

describe('SessionsFiltersCard', () => {
  let component: SessionsFiltersCard;
  let fixture: ComponentFixture<SessionsFiltersCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SessionsFiltersCard],
    }).compileComponents();

    fixture = TestBed.createComponent(SessionsFiltersCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should forward search term changes', () => {
    const emitSpy = jest.spyOn(component.searchTermChange, 'emit');
    const searchField = fixture.debugElement.query(
      By.directive(SearchFilterField)
    );

    searchField.componentInstance.handleInputChange('query');

    expect(emitSpy).toHaveBeenCalledWith('query');
  });

  it('should forward host filter changes', () => {
    const emitSpy = jest.spyOn(component.hostFilterChange, 'emit');
    const hostField = fixture.debugElement.query(By.directive(HostFilterField));

    hostField.componentInstance.handleInputChange('Alice');

    expect(emitSpy).toHaveBeenCalledWith('Alice');
  });

  it('should forward session type selections', () => {
    const emitSpy = jest.spyOn(component.sessionTypeChange, 'emit');
    const toggleGroup = fixture.debugElement.query(
      By.directive(SessionTypeToggleGroup)
    );

    toggleGroup.componentInstance.selectType('online');

    expect(emitSpy).toHaveBeenCalledWith('online');
  });

  it('should forward availability changes', () => {
    const emitSpy = jest.spyOn(component.availabilityChange, 'emit');
    const availabilityToggle = fixture.debugElement.query(
      By.directive(SessionAvailabilityToggle)
    );

    availabilityToggle.componentInstance.onAvailabilityChange(true);

    expect(emitSpy).toHaveBeenCalledWith(true);
  });
});
