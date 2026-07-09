import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfesorCurso } from './profesor-curso';

describe('ProfesorCurso', () => {
  let component: ProfesorCurso;
  let fixture: ComponentFixture<ProfesorCurso>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfesorCurso]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfesorCurso);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
