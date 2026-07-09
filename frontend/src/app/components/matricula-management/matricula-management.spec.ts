import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatriculaManagement } from './matricula-management';

describe('MatriculaManagement', () => {
  let component: MatriculaManagement;
  let fixture: ComponentFixture<MatriculaManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatriculaManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatriculaManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
