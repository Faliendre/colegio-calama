import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsignacionProfesorManagement } from './asignacion-profesor-management';

describe('AsignacionProfesorManagement', () => {
  let component: AsignacionProfesorManagement;
  let fixture: ComponentFixture<AsignacionProfesorManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsignacionProfesorManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsignacionProfesorManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
