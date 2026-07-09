import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlumnoManagement } from './alumno-management';

describe('AlumnoManagement', () => {
  let component: AlumnoManagement;
  let fixture: ComponentFixture<AlumnoManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlumnoManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlumnoManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
