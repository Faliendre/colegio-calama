import { TestBed } from '@angular/core/testing';

import { Asesor } from './asesor.service';

describe('Asesor', () => {
  let service: Asesor;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Asesor);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
