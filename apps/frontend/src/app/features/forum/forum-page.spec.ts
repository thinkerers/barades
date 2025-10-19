import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ForumPage } from './forum-page';

describe('ForumPage', () => {
  let component: ForumPage;
  let fixture: ComponentFixture<ForumPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForumPage],
    }).compileComponents();

    fixture = TestBed.createComponent(ForumPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render every forum category', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const categories = compiled.querySelectorAll('.forum-category');

    expect(categories.length).toBe(component.categories.length);
  });

  it('should show topic statistics', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const repliesChips = compiled.querySelectorAll('.topic-replies span');

    expect(repliesChips.length).toBeGreaterThan(0);
    repliesChips.forEach((chip) =>
      expect(chip.textContent?.trim()).not.toBe('')
    );
  });
});
