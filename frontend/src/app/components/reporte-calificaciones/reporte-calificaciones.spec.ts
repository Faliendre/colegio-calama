import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteCalificaciones } from './reporte-calificaciones';

describe('ReporteCalificaciones', () => {
  let component: ReporteCalificaciones;
  let fixture: ComponentFixture<ReporteCalificaciones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporteCalificaciones]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReporteCalificaciones);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
