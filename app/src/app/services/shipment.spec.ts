import { TestBed } from '@angular/core/testing';

import { Shipment } from './shipment';
import { ShipmentService } from './shipment';

describe('Shipment', () => {
  let service: ShipmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShipmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
