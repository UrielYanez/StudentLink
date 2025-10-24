import { TestBed } from '@angular/core/testing';

import { EmpresaContextService } from './empresa-context-service';

describe('EmpresaContextService', () => {
  let service: EmpresaContextService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmpresaContextService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
