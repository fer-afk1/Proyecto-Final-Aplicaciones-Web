import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioProductos } from './formulario-productos';

describe('FormularioProductos', () => {
  let component: FormularioProductos;
  let fixture: ComponentFixture<FormularioProductos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioProductos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormularioProductos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
