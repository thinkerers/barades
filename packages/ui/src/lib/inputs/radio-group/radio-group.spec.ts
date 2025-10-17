import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RadioGroupComponent, RadioOption } from './radio-group';

describe('RadioGroupComponent', () => {
  let component: RadioGroupComponent;
  let fixture: ComponentFixture<RadioGroupComponent>;

  const mockOptions: RadioOption[] = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2', icon: '🎮' },
    { value: 'option3', label: 'Option 3' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadioGroupComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RadioGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render all options', () => {
    fixture = TestBed.createComponent(RadioGroupComponent);
    component = fixture.componentInstance;
    component.options = mockOptions;
    fixture.detectChanges();

    const options = fixture.nativeElement.querySelectorAll(
      '.radio-group__option'
    );
    expect(options.length).toBe(3);
  });

  it('should render option labels', () => {
    fixture = TestBed.createComponent(RadioGroupComponent);
    component = fixture.componentInstance;
    component.options = mockOptions;
    fixture.detectChanges();

    const labels = fixture.nativeElement.querySelectorAll(
      '.radio-group__label'
    );
    expect(labels[0].textContent).toBe('Option 1');
    expect(labels[1].textContent).toBe('Option 2');
    expect(labels[2].textContent).toBe('Option 3');
  });

  it('should render icon when provided', () => {
    fixture = TestBed.createComponent(RadioGroupComponent);
    component = fixture.componentInstance;
    component.options = mockOptions;
    fixture.detectChanges();

    const icons = fixture.nativeElement.querySelectorAll('.radio-group__icon');
    expect(icons.length).toBe(1);
    expect(icons[0].textContent).toBe('🎮');
  });

  it('should not render icon when not provided', () => {
    fixture = TestBed.createComponent(RadioGroupComponent);
    component = fixture.componentInstance;
    component.options = [{ value: 'test', label: 'Test' }];
    fixture.detectChanges();

    const icons = fixture.nativeElement.querySelectorAll('.radio-group__icon');
    expect(icons.length).toBe(0);
  });

  it('should apply selected class to selected option', () => {
    fixture = TestBed.createComponent(RadioGroupComponent);
    component = fixture.componentInstance;
    component.options = mockOptions;
    component.value = 'option2';
    fixture.detectChanges();

    const options = fixture.nativeElement.querySelectorAll(
      '.radio-group__option'
    );
    expect(options[0].classList.contains('radio-group__option--selected')).toBe(
      false
    );
    expect(options[1].classList.contains('radio-group__option--selected')).toBe(
      true
    );
    expect(options[2].classList.contains('radio-group__option--selected')).toBe(
      false
    );
  });

  it('should emit valueChange when option is selected', (done) => {
    fixture = TestBed.createComponent(RadioGroupComponent);
    component = fixture.componentInstance;
    component.options = mockOptions;
    fixture.detectChanges();

    component.valueChange.subscribe((value: string) => {
      expect(value).toBe('option2');
      done();
    });

    component.selectOption('option2');
  });

  it('should check the selected radio input', () => {
    fixture = TestBed.createComponent(RadioGroupComponent);
    component = fixture.componentInstance;
    component.options = mockOptions;
    component.value = 'option2';
    fixture.detectChanges();

    const inputs = fixture.nativeElement.querySelectorAll(
      '.radio-group__input'
    );
    expect(inputs[0].checked).toBe(false);
    expect(inputs[1].checked).toBe(true);
    expect(inputs[2].checked).toBe(false);
  });

  it('should return true for isSelected when value matches', () => {
    component.value = 'test';
    expect(component.isSelected('test')).toBe(true);
    expect(component.isSelected('other')).toBe(false);
  });
});
