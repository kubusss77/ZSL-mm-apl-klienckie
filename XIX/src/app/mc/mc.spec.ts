import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MC } from './mc';

describe('MC', () => {
  let component: MC;
  let fixture: ComponentFixture<MC>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MC],
    }).compileComponents();

    fixture = TestBed.createComponent(MC);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
