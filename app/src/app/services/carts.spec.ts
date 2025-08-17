import { TestBed } from '@angular/core/testing';

import { Carts } from './carts';

describe('Carts', () => {
  let service: Carts;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Carts);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
