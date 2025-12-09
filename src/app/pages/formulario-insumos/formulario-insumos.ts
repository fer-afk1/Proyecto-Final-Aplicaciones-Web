import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { InsumosService, Insumo } from '../../services/insumos-service';

@Component({
  selector: 'app-formulario-insumos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './formulario-insumos.html',
  styleUrl: './formulario-insumos.scss',
})
export class FormularioInsumos implements OnInit {
  @Input() idEditar: number | null = null;
  @Input() proveedores: any[] = [];
  @Output() cerrar = new EventEmitter<void>();

  insumoForm!: FormGroup;
  cargando = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private insumosService: InsumosService
  ) {}

  ngOnInit() {
    this.insumoForm = this.fb.group({
      nombre: ['', Validators.required],
      categoria: ['Insumos', Validators.required],
      proveedor: ['', Validators.required],
      stock: [0, [Validators.required, Validators.min(0)]],
      unidad: ['kg', Validators.required],
      stock_minimo: [0, [Validators.required, Validators.min(0)]],
      precio: [0, [Validators.required, Validators.min(0)]],
      fecha_caducidad: ['']
    });

    if (this.idEditar) {
      this.cargarDatos(this.idEditar);
    }
  }

  cargarDatos(id: number) {
    this.cargando = true;
    this.insumosService.getInsumoById(id).subscribe({
      next: (data) => {
        // Formatear fecha si existe
        if (data.fecha_caducidad) {
          const fecha = new Date(data.fecha_caducidad);
          data.fecha_caducidad = fecha.toISOString().split('T')[0];
        }
        this.insumoForm.patchValue(data);
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar insumo:', err);
        this.error = 'Error al cargar los datos del insumo';
        this.cargando = false;
      }
    });
  }

  guardar() {
    if (this.insumoForm.invalid) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    this.cargando = true;
    this.error = null;
    const datos = this.insumoForm.value;

    if (this.idEditar) {
      // Actualizar
      this.insumosService.updateInsumo(this.idEditar, datos).subscribe({
        next: () => {
          alert('Insumo actualizado correctamente');
          this.cargando = false;
          this.cerrar.emit();
        },
        error: (err) => {
          console.error('Error al actualizar:', err);
          this.error = 'Error al actualizar el insumo';
          this.cargando = false;
        }
      });
    } else {
      // Crear
      this.insumosService.createInsumo(datos).subscribe({
        next: () => {
          alert('Insumo creado correctamente');
          this.cargando = false;
          this.cerrar.emit();
        },
        error: (err) => {
          console.error('Error al crear:', err);
          this.error = 'Error al crear el insumo';
          this.cargando = false;
        }
      });
    }
  }

  cancelar() {
    this.cerrar.emit();
  }
}