import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioInsumos } from './formulario-insumos';

describe('FormularioInsumos', () => {
  let component: FormularioInsumos;
  let fixture: ComponentFixture<FormularioInsumos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioInsumos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormularioInsumos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
