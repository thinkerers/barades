import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { SearchInputComponent } from './search-input';

describe('SearchInputComponent', () => {
  let component: SearchInputComponent;
  let fixture: ComponentFixture<SearchInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchInputComponent, FormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render input with default placeholder', () => {
    const input = fixture.nativeElement.querySelector('.search-input__field');
    expect(input).toBeTruthy();
    expect(input.placeholder).toBe('Rechercher...');
  });

  it('should render input with custom placeholder and icon', () => {
    fixture = TestBed.createComponent(SearchInputComponent);
    component = fixture.componentInstance;
    component.placeholder = 'Custom placeholder';
    component.icon = 'search';
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('.search-input__field');
    expect(input.placeholder).toBe('Custom placeholder');

    const iconEl = fixture.nativeElement.querySelector('.search-input__icon');
    expect(iconEl?.textContent?.trim()).toBe('search');
  });

  it('should emit valueChange on input', (done) => {
    component.valueChange.subscribe((value: string) => {
      expect(value).toBe('test');
      done();
    });

    component.onInput('test');
  });

  it('should show clear button when value is not empty', () => {
    fixture = TestBed.createComponent(SearchInputComponent);
    component = fixture.componentInstance;
    component.value = 'test';
    fixture.detectChanges();

    const clearButton = fixture.nativeElement.querySelector(
      '.search-input__clear'
    );
    expect(clearButton).toBeTruthy();
  });

  it('should not show clear button when value is empty', () => {
    const clearButton = fixture.nativeElement.querySelector(
      '.search-input__clear'
    );
    expect(clearButton).toBeFalsy();
  });

  it('should clear value and emit on clear button click', (done) => {
    fixture = TestBed.createComponent(SearchInputComponent);
    component = fixture.componentInstance;
    component.value = 'test';
    fixture.detectChanges();

    component.valueChange.subscribe((value: string) => {
      expect(value).toBe('');
      expect(component.value).toBe('');
      done();
    });

    component.clear();
  });

  it('should debounce input when debounce is set', (done) => {
    fixture = TestBed.createComponent(SearchInputComponent);
    component = fixture.componentInstance;
    component.debounce = 300;
    fixture.detectChanges();

    let emitCount = 0;
    component.valueChange.subscribe(() => {
      emitCount++;
    });

    component.onInput('test1');
    component.onInput('test2');
    component.onInput('test3');

    setTimeout(() => {
      expect(emitCount).toBe(1);
      done();
    }, 350);
  });

  it('should emit immediately when debounce is 0', () => {
    let emitCount = 0;
    component.valueChange.subscribe(() => {
      emitCount++;
    });

    component.onInput('test1');
    component.onInput('test2');

    expect(emitCount).toBe(2);
  });

  it('should apply inputId to input element when provided', () => {
    fixture = TestBed.createComponent(SearchInputComponent);
    component = fixture.componentInstance;
    component.inputId = 'custom-search-id';
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('.search-input__field');
    expect(input.id).toBe('custom-search-id');
  });

  it('should not have id attribute when inputId is not provided', () => {
    const input = fixture.nativeElement.querySelector('.search-input__field');
    expect(input.hasAttribute('id')).toBe(false);
  });

  it('should clear timer on destroy', () => {
    fixture = TestBed.createComponent(SearchInputComponent);
    component = fixture.componentInstance;
    component.debounce = 300;
    fixture.detectChanges();

    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
    component.onInput('test');

    fixture.destroy();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });
});
