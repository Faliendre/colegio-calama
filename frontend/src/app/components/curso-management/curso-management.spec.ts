import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CursoManagement } from './curso-management';

describe('CursoManagement', () => {
  let component: CursoManagement;
  let fixture: ComponentFixture<CursoManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CursoManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CursoManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
