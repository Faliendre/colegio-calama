import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsesorAsistencia } from './asesor-asistencia';

describe('AsesorAsistencia', () => {
  let component: AsesorAsistencia;
  let fixture: ComponentFixture<AsesorAsistencia>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsesorAsistencia]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsesorAsistencia);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
