import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfesorDashboard } from './profesor-dashboard';

describe('ProfesorDashboard', () => {
  let component: ProfesorDashboard;
  let fixture: ComponentFixture<ProfesorDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfesorDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfesorDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
