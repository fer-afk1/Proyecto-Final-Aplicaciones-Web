import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioProveedores } from './formulario-proveedores';

describe('FormularioProveedores', () => {
  let component: FormularioProveedores;
  let fixture: ComponentFixture<FormularioProveedores>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioProveedores]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormularioProveedores);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
