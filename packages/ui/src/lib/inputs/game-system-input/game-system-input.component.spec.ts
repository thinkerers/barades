import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameSystemInputComponent } from './game-system-input.component';

describe('GameSystemInputComponent', () => {
  let component: GameSystemInputComponent;
  let fixture: ComponentFixture<GameSystemInputComponent>;
  const gameSystems = [
    'Dungeons & Dragons 5e',
    'Pathfinder 2e',
    'Call of Cthulhu',
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameSystemInputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GameSystemInputComponent);
    component = fixture.componentInstance;
    component.gameSystems = gameSystems;
    component.ngOnChanges({
      gameSystems: new SimpleChange(undefined, gameSystems, true),
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit value changes when typing', () => {
    const emitted: string[] = [];
    component.valueChange.subscribe((value) => emitted.push(value));

    component.onInput('Pathfinder');

    expect(emitted).toEqual(['Pathfinder']);
    expect(component.filteredOptions.length).toBeGreaterThan(0);
  });

  it('should surface fuzzy suggestions for close matches', () => {
    component.onInput('dungeon and drago');

    expect(component.filteredOptions[0].value).toBe('Dungeons & Dragons 5e');
    expect(component.filteredOptions[0].fromSuggestion).toBe(true);
    expect(component.filteredOptions[0].similarity).toBeGreaterThan(0.5);
  });

  it('should emit events when selecting an option', () => {
    const selected: string[] = [];
    component.optionSelected.subscribe((value) => selected.push(value));

    component.selectOption('Pathfinder 2e');

    expect(component.value).toBe('Pathfinder 2e');
    expect(selected).toEqual(['Pathfinder 2e']);
  });

  it('should clear the value when requested', () => {
    const emitted: string[] = [];
    component.value = 'Call of Cthulhu';
    component.valueChange.subscribe((value) => emitted.push(value));

    component.clearValue();

    expect(component.value).toBe('');
    expect(emitted).toEqual(['']);
  });
});
