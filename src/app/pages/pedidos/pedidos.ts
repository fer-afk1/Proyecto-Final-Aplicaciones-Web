import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PedidosService, Pedido } from '../../services/pedidos-service';

@Component({
  selector: 'app-pedidos',
  imports: [CommonModule, FormsModule, DatePipe],
  standalone: true,
  templateUrl: './pedidos.html',
  styleUrl: './pedidos.scss',
})
export class Pedidos implements OnInit {
  pedidos: Pedido[] = [];
  pedidosFiltrados: Pedido[] = [];
  categoriaSeleccionada: string = 'Todas';
  terminoBusqueda: string = '';
  cargando: boolean = false;

  // Selección múltiple
  pedidosSeleccionados: Pedido[] = [];

  snackbar = {
    mostrar: false,
    mensaje: '',
    tipo: 'success' as 'success' | 'error'
  };

  constructor(private pedidosService: PedidosService) {}

  ngOnInit() {
    this.cargarPedidos();
  }

  cargarPedidos() {
    this.cargando = true;
    this.pedidosService.getPedidos().subscribe({
      next: (data) => {
        this.pedidos = data;
        this.aplicarFiltro();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar pedidos:', err);
        this.mostrarSnackbar('Error al cargar pedidos', 'error');
        this.cargando = false;
      }
    });
  }

  filtrarPorCategoria(categoria: string) {
    this.categoriaSeleccionada = categoria;
    this.aplicarFiltro();
  }

  buscarPedidos(event: any) {
    this.terminoBusqueda = event.target.value.toLowerCase();
    this.aplicarFiltro();
  }

  aplicarFiltro() {
    let resultado = this.pedidos;

    // Filtrar por categoría
    if (this.categoriaSeleccionada === 'Insumos') {
      resultado = resultado.filter(p => p.tipo === false);
    } else if (this.categoriaSeleccionada === 'Productos') {
      resultado = resultado.filter(p => p.tipo === true);
    } else if (['Pendiente', 'Entregado', 'Cancelado'].includes(this.categoriaSeleccionada)) {
      resultado = resultado.filter(p => 
        p.estado?.toLowerCase() === this.categoriaSeleccionada.toLowerCase()
      );
    }

    // Filtrar por búsqueda
    if (this.terminoBusqueda) {
      resultado = resultado.filter(p => 
        p.item.toLowerCase().includes(this.terminoBusqueda) ||
        p.proveedor.toLowerCase().includes(this.terminoBusqueda) ||
        `P-${p.id_pedido?.toString().padStart(3, '0')}`.toLowerCase().includes(this.terminoBusqueda)
      );
    }

    this.pedidosFiltrados = resultado;
  }

  seleccionarPedido(pedido: Pedido) {
    const index = this.pedidosSeleccionados.findIndex(
      p => p.id_pedido === pedido.id_pedido
    );

    if (index > -1) {
      this.pedidosSeleccionados.splice(index, 1);
    } else {
      this.pedidosSeleccionados.push(pedido);
    }
  }

  estaSeleccionado(pedido: Pedido): boolean {
    return this.pedidosSeleccionados.some(
      p => p.id_pedido === pedido.id_pedido
    );
  }

  limpiarSeleccion() {
    this.pedidosSeleccionados = [];
  }

  // Cambiar estado a entregado
  marcarComoEntregado() {
    if (this.pedidosSeleccionados.length === 0) {
      this.mostrarSnackbar('Selecciona al menos un pedido', 'error');
      return;
    }

    let procesados = 0;
    const total = this.pedidosSeleccionados.length;

    this.pedidosSeleccionados.forEach(pedido => {
      this.pedidosService.cambiarEstado(pedido.id_pedido!, 'entregado').subscribe({
        next: () => {
          procesados++;
          if (procesados === total) {
            this.mostrarSnackbar(`${total} pedido(s) marcado(s) como entregado`, 'success');
            this.limpiarSeleccion();
            this.cargarPedidos();
          }
        },
        error: (err) => {
          console.error('Error:', err);
          this.mostrarSnackbar('Error al actualizar pedido', 'error');
        }
      });
    });
  }

  // Cancelar pedidos
  cancelarPedidos() {
    if (this.pedidosSeleccionados.length === 0) {
      this.mostrarSnackbar('Selecciona al menos un pedido', 'error');
      return;
    }

    const confirmar = confirm(`¿Cancelar ${this.pedidosSeleccionados.length} pedido(s)?`);
    if (!confirmar) return;

    let procesados = 0;
    const total = this.pedidosSeleccionados.length;

    this.pedidosSeleccionados.forEach(pedido => {
      this.pedidosService.cambiarEstado(pedido.id_pedido!, 'cancelado').subscribe({
        next: () => {
          procesados++;
          if (procesados === total) {
            this.mostrarSnackbar(`${total} pedido(s) cancelado(s)`, 'success');
            this.limpiarSeleccion();
            this.cargarPedidos();
          }
        },
        error: (err) => {
          console.error('Error:', err);
          this.mostrarSnackbar('Error al cancelar pedido', 'error');
        }
      });
    });
  }

  // Eliminar pedidos
  eliminarSeleccionados() {
    if (this.pedidosSeleccionados.length === 0) {
      this.mostrarSnackbar('Selecciona al menos un pedido', 'error');
      return;
    }

    const confirmar = confirm(`¿Eliminar ${this.pedidosSeleccionados.length} pedido(s)? Esta acción no se puede deshacer.`);
    if (!confirmar) return;

    let eliminados = 0;
    const total = this.pedidosSeleccionados.length;

    this.pedidosSeleccionados.forEach(pedido => {
      this.pedidosService.deletePedido(pedido.id_pedido!).subscribe({
        next: () => {
          eliminados++;
          if (eliminados === total) {
            this.mostrarSnackbar(`${total} pedido(s) eliminado(s)`, 'success');
            this.limpiarSeleccion();
            this.cargarPedidos();
          }
        },
        error: (err) => {
          console.error('Error:', err);
          this.mostrarSnackbar('Error al eliminar pedido', 'error');
        }
      });
    });
  }

  mostrarSnackbar(mensaje: string, tipo: 'success' | 'error') {
    this.snackbar = { mostrar: true, mensaje, tipo };
    setTimeout(() => {
      this.snackbar.mostrar = false;
    }, 3000);
  }

  // Obtener clase del badge de estado
  getBadgeClass(estado?: string): string {
    if (estado === 'pendiente') return 'badge-pendiente';
    if (estado === 'entregado') return 'badge-entregado';
    if (estado === 'cancelado') return 'badge-cancelado';
    return 'badge-pendiente';
  }

  // Formato de ID de pedido
  formatearIdPedido(id?: number): string {
    return `P-${id?.toString().padStart(3, '0') || '000'}`;
  }

  // Tipo de pedido en texto
  getTipoTexto(tipo: boolean): string {
    return tipo ? 'Producto' : 'Insumo';
  }
}