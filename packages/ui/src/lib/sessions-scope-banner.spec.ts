import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SessionsScopeBanner } from './sessions-scope-banner';

describe('SessionsScopeBanner', () => {
  let component: SessionsScopeBanner;
  let fixture: ComponentFixture<SessionsScopeBanner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SessionsScopeBanner],
    }).compileComponents();

    fixture = TestBed.createComponent(SessionsScopeBanner);
    component = fixture.componentInstance;
    component.message = 'Vous consultez uniquement vos sessions.';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
