import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SearchFilterField } from './search-filter-field';

describe('SearchFilterField', () => {
  let component: SearchFilterField;
  let fixture: ComponentFixture<SearchFilterField>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchFilterField],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchFilterField);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit when the search value changes', () => {
    const handler = jest.fn();
    component.searchTermChange.subscribe(handler);

    const input = fixture.debugElement.query(By.css('input'));
    input.triggerEventHandler('ngModelChange', 'new value');

    expect(handler).toHaveBeenCalledWith('new value');
  });

  it('should reflect the provided search term value', async () => {
    component.searchTerm = 'initial value';
    fixture.detectChanges();

    await fixture.whenStable();

    const input: HTMLInputElement = fixture.debugElement.query(
      By.css('input')
    ).nativeElement;

    expect(input.value).toBe('initial value');
  });
});
