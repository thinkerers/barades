import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShowcasePage } from './showcase-page';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

describe('ShowcasePage', () => {
  let component: ShowcasePage;
  let fixture: ComponentFixture<ShowcasePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowcasePage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ShowcasePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
