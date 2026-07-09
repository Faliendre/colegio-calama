import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsesorDashboard } from './asesor-dashboard';

describe('AsesorDashboard', () => {
  let component: AsesorDashboard;
  let fixture: ComponentFixture<AsesorDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsesorDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsesorDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
