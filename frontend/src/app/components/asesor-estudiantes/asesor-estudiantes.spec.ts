import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsesorEstudiantes } from './asesor-estudiantes';

describe('AsesorEstudiantes', () => {
  let component: AsesorEstudiantes;
  let fixture: ComponentFixture<AsesorEstudiantes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsesorEstudiantes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsesorEstudiantes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
