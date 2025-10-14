import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { SessionsListPage } from './sessions-list';

describe('SessionsListPage', () => {
  let component: SessionsListPage;
  let fixture: ComponentFixture<SessionsListPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SessionsListPage, RouterModule.forRoot([])],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SessionsListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with loading state', () => {
    expect(component.loading).toBe(true);
  });

  it('should have empty sessions array initially', () => {
    expect(component.sessions).toEqual([]);
  });
});
