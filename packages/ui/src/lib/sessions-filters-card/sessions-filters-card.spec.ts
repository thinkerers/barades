import { ComponentFixture, TestBed } from '@angular/core/testing';
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
});
