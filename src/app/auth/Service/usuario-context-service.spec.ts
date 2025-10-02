import { TestBed } from '@angular/core/testing';

import { UsuarioContextService } from './usuario-context-service';

describe('UsuarioContextService', () => {
  let service: UsuarioContextService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UsuarioContextService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
