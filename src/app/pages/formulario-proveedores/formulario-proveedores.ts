import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProveedoresService } from '../../services/proveedores-service';

// Interfaz para el proveedor
export interface Proveedor {
  id_proveedor?: number;
  nombre: string;
  categoria: string;
  item: string;
  correo: string;
  telefono?: string;
  direccion: string;
  contacto: string;
  fecha_registro?: string;
}

@Component({
  selector: 'app-formulario-proveedores',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './formulario-proveedores.html',
  styleUrl: './formulario-proveedores.scss',
})
export class FormularioProveedores implements OnInit {
  @Input() idEditar: number | null = null;
  @Output() cerrar = new EventEmitter<void>();

  proveedorForm!: FormGroup;
  cargando = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private proveedoresService: ProveedoresService
  ) {}

  ngOnInit() {
    this.proveedorForm = this.fb.group({
      nombre: ['', Validators.required],
      categoria: ['Insumos', Validators.required], // Valor por defecto
      item: ['', Validators.required],
      telefono: [''],
      correo: ['', [Validators.required, Validators.email]],
      direccion: ['', Validators.required],
      contacto: ['', Validators.required]
    });

    if (this.idEditar) {
      this.cargarDatos(this.idEditar);
    }
  }

  cargarDatos(id: number) {
    this.cargando = true;
    this.proveedoresService.getProveedorById(id).subscribe({
      next: (data) => {
        this.proveedorForm.patchValue(data);
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar proveedor:', err);
        this.error = 'Error al cargar los datos del proveedor';
        this.cargando = false;
      }
    });
  }

  guardar() {
    if (this.proveedorForm.invalid) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    this.cargando = true;
    this.error = null;
    const datos = this.proveedorForm.value;

    if (this.idEditar) {
      // Actualizar
      this.proveedoresService.updateProveedor(this.idEditar, datos).subscribe({
        next: () => {
          alert('Proveedor actualizado correctamente');
          this.cargando = false;
          this.cerrar.emit();
        },
        error: (err) => {
          console.error('Error al actualizar:', err);
          this.error = 'Error al actualizar el proveedor';
          this.cargando = false;
        }
      });
    } else {
      // Crear
      this.proveedoresService.createProveedor(datos).subscribe({
        next: () => {
          alert('Proveedor creado correctamente');
          this.cargando = false;
          this.cerrar.emit();
        },
        error: (err) => {
          console.error('Error al crear:', err);
          this.error = 'Error al crear el proveedor';
          this.cargando = false;
        }
      });
    }
  }

  cancelar() {
    this.cerrar.emit();
  }
}