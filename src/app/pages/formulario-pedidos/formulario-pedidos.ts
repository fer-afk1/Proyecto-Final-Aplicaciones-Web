import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PedidosService, Pedido } from '../../services/pedidos-service';

@Component({
  selector: 'app-formulario-pedido',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './formulario-pedidos.html',
  styleUrl: './formulario-pedidos.scss'
})
export class FormularioPedido implements OnInit {
  @Input() insumosSeleccionados: any[] = [];
  @Input() proveedores: any[] = [];
  @Input() pedidoId?: number;
  @Output() cerrar = new EventEmitter<void>();

  esModoEdicion = false;
  pedidoEditar: Pedido = {
    proveedor: '',
    item: '',
    cantidad: 1,
    unidad: 'kg',
    tipo: false,
    precio: 0,
    estado: 'pendiente'
  };

  cantidades: number[] = [];
  unidades: string[] = [];
  precios: number[] = [];
  preciosUnitarios: number[] = []; // ✅ NUEVO: Precio por unidad
  fechaLlegada: string = '';

  // ✅ NUEVO: Para modo edición
  precioUnitarioEdicion: number = 0;

  constructor(private pedidosService: PedidosService) {}

  ngOnInit() {
    if (this.pedidoId) {
      this.esModoEdicion = true;
      this.cargarPedido();
    } else {
      this.inicializarArrays();
    }

    // Fecha de llegada por defecto: 7 días desde hoy
    const fechaFutura = new Date();
    fechaFutura.setDate(fechaFutura.getDate() + 7);
    this.fechaLlegada = fechaFutura.toISOString().split('T')[0];
  }

  inicializarArrays() {
    this.cantidades = this.insumosSeleccionados.map(() => 1);
    this.unidades = this.insumosSeleccionados.map(i => i.unidad || 'kg');
    
    // ✅ Inicializar precios unitarios desde la propiedad 'precio' del insumo
    this.preciosUnitarios = this.insumosSeleccionados.map(i => i.precio || 0);
    
    // ✅ Calcular precios totales iniciales
    this.precios = this.insumosSeleccionados.map((i, index) => 
      this.cantidades[index] * this.preciosUnitarios[index]
    );
  }

  cargarPedido() {
    this.pedidosService.getPedidoById(this.pedidoId!).subscribe({
      next: (data) => {
        this.pedidoEditar = data;
        
        // ✅ Calcular precio unitario basado en el total
        if (data.cantidad && data.precio) {
          this.precioUnitarioEdicion = data.precio / data.cantidad;
        }
        
        if (data.fecha_llegada) {
          this.fechaLlegada = data.fecha_llegada.split('T')[0];
        }
      },
      error: (err) => console.error('Error al cargar pedido:', err)
    });
  }

  // ✅ Calcular precio total cuando cambia la cantidad
  actualizarPrecio(index: number) {
    this.precios[index] = this.cantidades[index] * this.preciosUnitarios[index];
  }

  // ✅ Para modo edición
  actualizarPrecioEdicion() {
    if (this.pedidoEditar.cantidad > 0) {
      this.pedidoEditar.precio = this.pedidoEditar.cantidad * this.precioUnitarioEdicion;
    }
  }

  guardar() {
    if (this.esModoEdicion) {
      this.actualizarPedido();
    } else {
      this.crearPedidos();
    }
  }

  crearPedidos() {
    let pedidosCreados = 0;
    const totalPedidos = this.insumosSeleccionados.length;

    this.insumosSeleccionados.forEach((insumo, index) => {
      const pedido: Pedido = {
        proveedor: insumo.proveedor,
        item: insumo.nombre,
        cantidad: this.cantidades[index],
        unidad: this.unidades[index],
        tipo: false, // false = insumo
        precio: this.precios[index],
        fecha_llegada: this.fechaLlegada,
        estado: 'pendiente'
      };

      this.pedidosService.createPedido(pedido).subscribe({
        next: () => {
          pedidosCreados++;
          if (pedidosCreados === totalPedidos) {
            alert(`${totalPedidos} pedido(s) creado(s) correctamente`);
            this.cerrar.emit();
          }
        },
        error: (err) => {
          console.error('Error al crear pedido:', err);
          alert(`Error al crear pedido de ${insumo.nombre}`);
        }
      });
    });
  }

  actualizarPedido() {
    const pedidoActualizado = {
      ...this.pedidoEditar,
      fecha_llegada: this.fechaLlegada
    };

    this.pedidosService.updatePedido(this.pedidoId!, pedidoActualizado).subscribe({
      next: () => {
        alert('Pedido actualizado correctamente');
        this.cerrar.emit();
      },
      error: (err) => {
        console.error('Error al actualizar:', err);
        alert('Error al actualizar el pedido');
      }
    });
  }

  cancelar() {
    this.cerrar.emit();
  }
}