import { TestBed } from '@angular/core/testing';

import { Maching } from './maching';

describe('Maching', () => {
  let service: Maching;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Maching);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
