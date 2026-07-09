import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsesorFichaEstudiante } from './asesor-ficha-estudiante';

describe('AsesorFichaEstudiante', () => {
  let component: AsesorFichaEstudiante;
  let fixture: ComponentFixture<AsesorFichaEstudiante>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsesorFichaEstudiante]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsesorFichaEstudiante);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
