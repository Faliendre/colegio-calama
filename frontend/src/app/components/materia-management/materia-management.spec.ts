import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MateriaManagement } from './materia-management';

describe('MateriaManagement', () => {
  let component: MateriaManagement;
  let fixture: ComponentFixture<MateriaManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MateriaManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MateriaManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
