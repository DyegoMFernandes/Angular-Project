import { TestBed } from '@angular/core/testing';

import { Shoppingcart } from './shoppingcart';

describe('Shoppingcart', () => {
  let service: Shoppingcart;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Shoppingcart);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
