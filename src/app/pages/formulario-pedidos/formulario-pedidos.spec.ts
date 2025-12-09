import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioPedido } from './formulario-pedidos';

describe('FormularioPedido', () => {
  let component: FormularioPedido;
  let fixture: ComponentFixture<FormularioPedido>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioPedido]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormularioPedido);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
