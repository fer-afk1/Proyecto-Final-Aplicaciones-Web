import { TestBed } from '@angular/core/testing';

import { PedidosService } from './pedidos-service';

describe('Pedidos', () => {
  let service: PedidosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PedidosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
