import { TestBed } from '@angular/core/testing';

import { Profesor } from './profesor';

describe('Profesor', () => {
  let service: Profesor;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Profesor);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
