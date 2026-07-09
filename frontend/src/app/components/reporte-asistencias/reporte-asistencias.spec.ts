import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteAsistencias } from './reporte-asistencias';

describe('ReporteAsistencias', () => {
  let component: ReporteAsistencias;
  let fixture: ComponentFixture<ReporteAsistencias>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporteAsistencias]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReporteAsistencias);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
