import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsesorReporteNotas } from './asesor-reporte-notas';

describe('AsesorReporteNotas', () => {
  let component: AsesorReporteNotas;
  let fixture: ComponentFixture<AsesorReporteNotas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsesorReporteNotas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsesorReporteNotas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
